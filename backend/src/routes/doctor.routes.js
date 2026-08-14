const express = require("express");
const doctorController = require("../controllers/doctorController");
const patientController = require("../controllers/patientController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", doctorController.createDoctor);
router.get("/", doctorController.getDoctors);
router.get("/:doctorId/patients", patientController.getDoctorPatients);
router.get("/:id", doctorController.getDoctor);
router.put("/:id", doctorController.updateDoctor);
router.delete("/:id", doctorController.deleteDoctor);

module.exports = router;
