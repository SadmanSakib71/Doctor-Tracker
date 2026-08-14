const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const ApiError = require("../utils/ApiError");

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;
const ALLOWED_SORT_FIELDS = ["createdAt", "name"];
const DOCTOR_FIELDS = ["name", "specialization", "hospital", "phone", "email"];

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

function requireValidDoctorId(id) {
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid doctor ID");
  }
}

function toDoctorResponse(doctor) {
  return {
    id: doctor._id,
    name: doctor.name,
    specialization: doctor.specialization,
    hospital: doctor.hospital,
    phone: doctor.phone,
    email: doctor.email,
    createdAt: doctor.createdAt,
    updatedAt: doctor.updatedAt,
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

function buildDoctorFilter(query) {
  const filter = {};

  const search = typeof query.search === "string" ? query.search.trim() : "";
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: regex }, { specialization: regex }, { hospital: regex }];
  }

  const specialization =
    typeof query.specialization === "string" ? query.specialization.trim() : "";
  if (specialization) {
    filter.specialization = new RegExp(`^${escapeRegex(specialization)}$`, "i");
  }

  const hospital = typeof query.hospital === "string" ? query.hospital.trim() : "";
  if (hospital) {
    filter.hospital = new RegExp(`^${escapeRegex(hospital)}$`, "i");
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

function pickDoctorFields(body) {
  const fields = {};

  for (const key of DOCTOR_FIELDS) {
    if (body[key] !== undefined) {
      fields[key] = body[key];
    }
  }

  return fields;
}

async function createDoctor(req, res, next) {
  try {
    const { name, specialization, hospital, phone, email } = req.body;

    if (!name || !specialization || !hospital || !phone || !email) {
      throw new ApiError(
        400,
        "Name, specialization, hospital, phone, and email are required"
      );
    }

    const doctor = await Doctor.create({
      name,
      specialization,
      hospital,
      phone,
      email,
    });

    res.status(201).json({
      success: true,
      data: toDoctorResponse(doctor),
    });
  } catch (error) {
    next(error);
  }
}

async function getDoctors(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query);
    const filter = buildDoctorFilter(req.query);

    const [doctors, total] = await Promise.all([
      Doctor.find(filter).sort(sort).skip(skip).limit(limit).select("-__v").lean(),
      Doctor.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: doctors.map(toDoctorResponse),
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

async function getDoctor(req, res, next) {
  try {
    requireValidDoctorId(req.params.id);

    const doctor = await Doctor.findById(req.params.id).select("-__v").lean();

    if (!doctor) {
      throw new ApiError(404, "Doctor not found");
    }

    res.status(200).json({
      success: true,
      data: toDoctorResponse(doctor),
    });
  } catch (error) {
    next(error);
  }
}

async function updateDoctor(req, res, next) {
  try {
    requireValidDoctorId(req.params.id);

    const updates = pickDoctorFields(req.body);

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "No valid fields provided to update");
    }

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-__v");

    if (!doctor) {
      throw new ApiError(404, "Doctor not found");
    }

    res.status(200).json({
      success: true,
      data: toDoctorResponse(doctor),
    });
  } catch (error) {
    next(error);
  }
}

async function deleteDoctor(req, res, next) {
  try {
    requireValidDoctorId(req.params.id);

    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      throw new ApiError(404, "Doctor not found");
    }

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
};
