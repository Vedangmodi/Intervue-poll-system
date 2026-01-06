const User = require('../models/User.model');

class UserService {
  /**
   * Create or update user
   */
  async createUser(userId, name, role) {
    try {
      let user = await User.findOne({ userId });
      
      if (user) {
        // Update existing user
        user.name = name;
        user.role = role;
        user.isActive = true;
        user.kickedOut = false;
        await user.save();
      } else {
        // Create new user
        user = new User({
          userId,
          name,
          role,
          isActive: true
        });
        await user.save();
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active students
   */
  async getActiveStudents() {
    try {
      const students = await User.find({
        role: 'student',
        isActive: true,
        kickedOut: false
      }).sort({ createdAt: -1 });

      return students.map(student => ({
        userId: student.userId,
        name: student.name,
        role: student.role
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Kick out a student
   */
  async kickOutStudent(studentId) {
    try {
      const user = await User.findOne({ userId: studentId });
      if (!user) {
        throw new Error('Student not found');
      }

      user.kickedOut = true;
      user.isActive = false;
      await user.save();

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user is kicked out
   */
  async isKickedOut(userId) {
    try {
      const user = await User.findOne({ userId });
      return user ? user.kickedOut : false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update socket ID for user
   */
  async updateSocketId(userId, socketId) {
    try {
      await User.updateOne(
        { userId },
        { socketId, isActive: true },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error updating socket ID:', error);
    }
  }

  /**
   * Disconnect user
   */
  async disconnectUser(socketId) {
    try {
      await User.updateOne(
        { socketId },
        { socketId: null }
      );
    } catch (error) {
      console.error('Error disconnecting user:', error);
    }
  }
}

module.exports = new UserService();

