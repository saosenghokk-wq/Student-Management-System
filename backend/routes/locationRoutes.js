const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/provinces', authMiddleware, locationController.getProvinces);
router.get('/districts/:provinceId', authMiddleware, locationController.getDistricts);
router.get('/communes/:districtId', authMiddleware, locationController.getCommunes);
router.get('/villages/:communeId', authMiddleware, locationController.getVillages);
router.get('/batches', authMiddleware, locationController.getBatches);
router.get('/student-statuses', authMiddleware, locationController.getStudentStatuses);
router.get('/scholarships', authMiddleware, locationController.getScholarships);
router.get('/programs/:departmentId', authMiddleware, locationController.getProgramsByDepartment);
router.get('/batches/:programId', authMiddleware, locationController.getBatchesByProgram);

module.exports = router;
