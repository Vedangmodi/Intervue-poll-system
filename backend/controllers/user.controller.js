const userService = require('../services/user.service');

class UserController {
  /**
   * Create or update user
   */
  async createUser(req, res) {
    try {
      const { userId, name, role } = req.body;
      
      if (!userId || !name || !role) {
        return res.status(400).json({ error: 'userId, name, and role are required' });
      }

      const user = await userService.createUser(userId, name, role);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get active students
   */
  async getActiveStudents(req, res) {
    try {
      const students = await userService.getActiveStudents();
      res.json({ students });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Kick out a student
   */
  async kickOutStudent(req, res) {
    try {
      const { studentId } = req.params;
      
      // Get student's socketId before kicking out
      const User = require('../models/User.model');
      const studentUser = await User.findOne({ userId: studentId });
      
      if (!studentUser) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Kick out the student
      const user = await userService.kickOutStudent(studentId);
      
      // Notify student via socket if connected
      if (global.io) {
        let studentSocket = null;
        
        // Find socket using socketId from database
        if (studentUser.socketId) {
          studentSocket = global.io.sockets.sockets.get(studentUser.socketId);
        }
        
        if (studentSocket) {
          studentSocket.emit('kicked_out');
          console.log(`Kicked out student ${studentId} via API and notified via socket ${studentSocket.id}`);
        } else {
          console.log(`Student ${studentId} was kicked out via API but socket not found (may be disconnected)`);
        }

        // Update students list for teacher
        const students = await userService.getActiveStudents();
        global.io.emit('students_list', { students });
      }
      
      res.json({ success: true, user });
    } catch (error) {
      console.error('Error in kickOutStudent controller:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UserController();

