const asyncHandler = require('../utils/asyncHandler');
const studentService = require('../services/studentService');

exports.getAllStudents = asyncHandler(async (req, res) => {
  const students = await studentService.listStudents();
  res.json(students);
});

exports.getStudentById = asyncHandler(async (req, res) => {
  const student = await studentService.getStudent(req.params.id);
  res.json(student);
});

exports.createStudent = asyncHandler(async (req, res) => {
  const created = await studentService.createStudent(req.body);
  res.status(201).json(created);
});

exports.updateStudent = asyncHandler(async (req, res) => {
  console.log('\n=== UPDATE STUDENT REQUEST ===');
  console.log('Student ID:', req.params.id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Has username:', req.body.username !== undefined);
  console.log('Has email:', req.body.email !== undefined);
  console.log('Has status:', req.body.status !== undefined);
  if (req.body.status !== undefined) {
    console.log('Status value:', req.body.status, 'Type:', typeof req.body.status);
  }
  
  const updated = await studentService.updateStudent(req.params.id, req.body);
  
  console.log('=== UPDATE STUDENT COMPLETE ===\n');
  res.json(updated);
});

exports.deleteStudent = asyncHandler(async (req, res) => {
  await studentService.deleteStudent(req.params.id);
  res.status(204).send();
});

exports.getStudentsByBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const students = await studentService.getStudentsByBatch(batchId);
  res.json({ success: true, data: students });
});

exports.uploadStudentImage = asyncHandler(async (req, res) => {
  const { imageData } = req.body;

  if (!imageData) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  // Validate base64 image format
  if (!imageData.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Invalid image format' });
  }

  // Check image size (base64 is ~33% larger than binary, so 5MB binary = ~6.6MB base64)
  const sizeInBytes = (imageData.length * 3) / 4;
  if (sizeInBytes > 5 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image size exceeds 5MB limit' });
  }

  try {
    const updated = await studentService.updateStudentImage(req.params.id, imageData);
    res.json({ message: 'Profile image updated successfully', profile_image: imageData });
  } catch (error) {
    throw error;
  }
});
