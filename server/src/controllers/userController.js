import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import fs from 'fs/promises';

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-passwordHash -refreshTokens -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, username, bio } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username: username.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username.toLowerCase();
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatarUrl && user.avatarUrl.includes('cloudinary')) {
      const publicIdMatch = user.avatarUrl.match(/\/([^\/]+)\.[^.]+$/);
      if (publicIdMatch) {
        const publicId = `chatflow/avatars/${publicIdMatch[1]}`;
        await deleteFromCloudinary(publicId).catch(err => 
          console.error('Failed to delete old avatar:', err)
        );
      }
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file);

    // Update user avatar URL
    user.avatarUrl = result.url;
    await user.save();

    // Delete local file
    await fs.unlink(req.file.path).catch(err => 
      console.error('Failed to delete local file:', err)
    );

    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    
    // Clean up local file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => 
        console.error('Failed to delete local file:', err)
      );
    }
    
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a password (OAuth users might not)
    if (!user.passwordHash) {
      return res.status(400).json({ 
        message: 'Cannot change password for OAuth accounts' 
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.passwordHash = newPassword;
    
    // Invalidate all refresh tokens for security
    user.refreshTokens = [];
    
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users (for username search → start chat feature)
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.userId;

    if (!q || q.trim().length === 0) {
      return res.json({ users: [] });
    }

    // Search by username (partial, case-insensitive)
    // Limit to 10 results as per spec
    const users = await User.find(
      {
        _id: { $ne: currentUserId }, // Exclude current user
        username: { $regex: q, $options: 'i' }, // Case-insensitive partial match
      },
      '_id username avatarUrl' // Only return minimal fields
    ).limit(10);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (for search/discovery)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.userId } }, // Exclude current user
      '_id username avatarUrl'
    ).limit(50); // Limit to 50 users

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get online users
export const getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find(
      { isOnline: true, _id: { $ne: req.userId } },
      'name username avatarUrl bio'
    ).limit(50);

    res.json({ users });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
