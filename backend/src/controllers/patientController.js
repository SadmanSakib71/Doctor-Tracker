const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const ApiError = require("../utils/ApiError");

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;
const ALLOWED_SORT_FIELDS = ["createdAt", "name", "age"];
const ALLOWED_GENDERS = ["male", "female", "other"];
const PATIENT_FIELDS = [
  "doctorId",
  "name",
  "email",
  "phone",
  "age",
  "gender",
  "condition",
  "address",
];
const DOCTOR_POPULATE = "name specialization hospital";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

function requireValidObjectId(id, label) {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
}

function toPatientResponse(patient) {
  const rawDoctor = patient.doctorId;
  const isPopulated = Boolean(rawDoctor && typeof rawDoctor === "object" && rawDoctor._id);

  return {
    id: patient._id,
    doctorId: isPopulated ? rawDoctor._id : rawDoctor,
    doctor: isPopulated
      ? {
          id: rawDoctor._id,
          name: rawDoctor.name,
          specialization: rawDoctor.specialization,
          hospital: rawDoctor.hospital,
        }
      : null,
    name: patient.name,
    email: patient.email,
    phone: patient.phone,
    age: patient.age,
    gender: patient.gender,
    condition: patient.condition,
    address: patient.address,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseUtcDate(value, fieldName) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ApiError(400, `Invalid ${fieldName}. Use YYYY-MM-DD.`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new ApiError(400, `Invalid ${fieldName}. Use YYYY-MM-DD.`);
  }

  return date;
}

function parsePagination(query) {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);

  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  let limit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_LIMIT;

  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function parseSort(query) {
  const sortBy = ALLOWED_SORT_FIELDS.includes(query.sortBy) ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  return { [sortBy]: sortOrder };
}

function buildPatientFilter(query) {
  const filter = {};

  const search = typeof query.search === "string" ? query.search.trim() : "";
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }, { condition: regex }];
  }

  const doctorId = typeof query.doctorId === "string" ? query.doctorId.trim() : "";
  if (doctorId) {
    requireValidObjectId(doctorId, "doctor ID");
    filter.doctorId = doctorId;
  }

  const condition = typeof query.condition === "string" ? query.condition.trim() : "";
  if (condition) {
    filter.condition = new RegExp(`^${escapeRegex(condition)}$`, "i");
  }

  const gender = typeof query.gender === "string" ? query.gender.trim().toLowerCase() : "";
  if (gender) {
    if (!ALLOWED_GENDERS.includes(gender)) {
      throw new ApiError(400, "Gender must be male, female, or other");
    }
    filter.gender = gender;
  }

  const fromDate = typeof query.fromDate === "string" ? query.fromDate.trim() : "";
  const toDate = typeof query.toDate === "string" ? query.toDate.trim() : "";

  if (fromDate || toDate) {
    filter.createdAt = {};

    if (fromDate) {
      filter.createdAt.$gte = parseUtcDate(fromDate, "fromDate");
    }

    if (toDate) {
      const startOfToDate = parseUtcDate(toDate, "toDate");
      const startOfNextDay = new Date(startOfToDate);
      startOfNextDay.setUTCDate(startOfNextDay.getUTCDate() + 1);
      filter.createdAt.$lt = startOfNextDay;
    }
  }

  return filter;
}

function pickPatientFields(body) {
  const fields = {};

  for (const key of PATIENT_FIELDS) {
    if (body[key] !== undefined) {
      fields[key] = body[key];
    }
  }

  return fields;
}

async function requireExistingDoctor(doctorId) {
  requireValidObjectId(doctorId, "doctor ID");

  const doctorExists = await Doctor.exists({ _id: doctorId });

  if (!doctorExists) {
    throw new ApiError(404, "Doctor not found");
  }
}

async function findPatients(query, extraFilter = {}) {
  const { page, limit, skip } = parsePagination(query);
  const sort = parseSort(query);
  const filter = { ...buildPatientFilter(query), ...extraFilter };

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .populate("doctorId", DOCTOR_POPULATE)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean(),
    Patient.countDocuments(filter),
  ]);

  return { patients, total, page, limit };
}

async function createPatient(req, res, next) {
  try {
    const { doctorId, name, email, phone, age, gender, condition, address } = req.body;

    if (!doctorId || !name || !phone || !condition) {
      throw new ApiError(400, "Doctor ID, name, phone, and condition are required");
    }

    await requireExistingDoctor(doctorId);

    const patient = await Patient.create({
      doctorId,
      name,
      email,
      phone,
      age,
      gender,
      condition,
      address,
    });

    await patient.populate("doctorId", DOCTOR_POPULATE);

    res.status(201).json({
      success: true,
      data: toPatientResponse(patient),
    });
  } catch (error) {
    next(error);
  }
}

async function getPatients(req, res, next) {
  try {
    const { patients, total, page, limit } = await findPatients(req.query);

    res.status(200).json({
      success: true,
      data: patients.map(toPatientResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getPatient(req, res, next) {
  try {
    requireValidObjectId(req.params.id, "patient ID");

    const patient = await Patient.findById(req.params.id)
      .populate("doctorId", DOCTOR_POPULATE)
      .select("-__v")
      .lean();

    if (!patient) {
      throw new ApiError(404, "Patient not found");
    }

    res.status(200).json({
      success: true,
      data: toPatientResponse(patient),
    });
  } catch (error) {
    next(error);
  }
}

async function updatePatient(req, res, next) {
  try {
    requireValidObjectId(req.params.id, "patient ID");

    const updates = pickPatientFields(req.body);

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "No valid fields provided to update");
    }

    if (updates.doctorId !== undefined) {
      await requireExistingDoctor(updates.doctorId);
    }

    const patient = await Patient.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("doctorId", DOCTOR_POPULATE)
      .select("-__v");

    if (!patient) {
      throw new ApiError(404, "Patient not found");
    }

    res.status(200).json({
      success: true,
      data: toPatientResponse(patient),
    });
  } catch (error) {
    next(error);
  }
}

async function deletePatient(req, res, next) {
  try {
    requireValidObjectId(req.params.id, "patient ID");

    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      throw new ApiError(404, "Patient not found");
    }

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function getDoctorPatients(req, res, next) {
  try {
    await requireExistingDoctor(req.params.doctorId);

    const { patients, total, page, limit } = await findPatients(req.query, {
      doctorId: req.params.doctorId,
    });

    res.status(200).json({
      success: true,
      data: patients.map(toPatientResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
  getDoctorPatients,
};
