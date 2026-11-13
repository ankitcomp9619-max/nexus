import User from "../models/user.model.js"
import Session from "../models/session.model.js"


import {generatetoken} from "../utils/token.js"
import bcrypt from "bcryptjs"
import crypto from "node:crypto"

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const createRefreshToken = () => {
  return crypto.randomBytes(48).toString("hex");
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
    path: "/"
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth"
  });
};

// REGISTER
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    next(error);
  }
};



//login


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const accessToken = generatetoken(user);
    const refreshToken = createRefreshToken();

    const session = await Session.create({
      userId: user._id,
      refreshTokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.get("user-agent"),
      ipAddress: req.ip
    });

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        sessionId: session._id
      }
    });

  } catch (error) {
    next(error);
  }
};

//Logout

export const logout = async (req, res, next) => {
  
    try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await Session.findOneAndUpdate(
        {
          refreshTokenHash: hashToken(refreshToken)
        },
        {
          $set: { revokedAt: new Date() }
        }
      );
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth"
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });

  } catch (error) {
    next(error);
  }
};

//refresh token 
export const refresh = async (req, res, next) => {
  try {
    const oldToken = req.cookies.refreshToken;

    if (!oldToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing"
      });
    }

    const oldHash = hashToken(oldToken);

    const session = await Session.findOne({
      refreshTokenHash: oldHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    }).select("+refreshTokenHash");

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session"
      });
    }

    const newRefreshToken = createRefreshToken();

    // Atomic rotation: only one request can consume the old token.
    const updatedSession = await Session.findOneAndUpdate(
      {
        _id: session._id,
        refreshTokenHash: oldHash,
        revokedAt: null,
        expiresAt: { $gt: new Date() }
      },
      {
        $set: {
          refreshTokenHash: hashToken(newRefreshToken)
        }
      },
      { new: true }
    );

    if (!updatedSession) {
      return res.status(401).json({
        success: false,
        message: "Session already refreshed or revoked"
      });
    }

    const user = await User.findById(session.userId);

    if (!user) {
      await Session.updateOne(
        { _id: session._id },
        { $set: { revokedAt: new Date() } }
      );

      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      });
    }

    const accessToken = generatetoken(user);

    setAuthCookies(res, accessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      message: "Tokens refreshed"
    });

  } catch (error) {
    next(error);
  }
};

