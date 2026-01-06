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
      const user = await userService.kickOutStudent(studentId);
      
      // Notify student via socket if connected
      if (global.io) {
        const studentSocket = Array.from(global.io.sockets.sockets.values())
          .find(s => {
            // Find socket by checking active connections
            // This would need to be tracked in socket handler
            return false; // Simplified - actual implementation would check socket map
          });

        if (studentSocket) {
          studentSocket.emit('kicked_out');
        }

        // Update students list for teacher
        const students = await userService.getActiveStudents();
        global.io.emit('students_list', { students });
      }
      
      res.json({ success: true, user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UserController();

