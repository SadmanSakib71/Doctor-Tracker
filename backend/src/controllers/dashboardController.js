const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const TOP_DOCTORS = 10;
const TOP_CONDITIONS = 8;
const TREND_DAYS = 30;

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toUtcDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function roundToTwo(value) {
  return Math.round(value * 100) / 100;
}

function fillMissingDates(rows, rangeStart, days) {
  const countsByDate = new Map(rows.map((row) => [row.date, row.count]));
  const filled = [];

  for (let index = 0; index < days; index += 1) {
    const dateKey = toUtcDateKey(addUtcDays(rangeStart, index));
    filled.push({
      date: dateKey,
      count: countsByDate.get(dateKey) || 0,
    });
  }

  return filled;
}

async function getPatientsPerDoctor() {
  return Doctor.aggregate([
    {
      $lookup: {
        from: Patient.collection.name,
        localField: "_id",
        foreignField: "doctorId",
        pipeline: [{ $count: "count" }],
        as: "patientCount",
      },
    },
    {
      $project: {
        _id: 0,
        doctorName: "$name",
        patients: {
          $ifNull: [{ $arrayElemAt: ["$patientCount.count", 0] }, 0],
        },
      },
    },
    { $sort: { patients: -1, doctorName: 1 } },
    { $limit: TOP_DOCTORS },
  ]);
}

async function getPatientsByCondition() {
  return Patient.aggregate([
    {
      $group: {
        _id: "$condition",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    { $limit: TOP_CONDITIONS },
    {
      $project: {
        _id: 0,
        condition: "$_id",
        count: 1,
      },
    },
  ]);
}

async function getCreatedOverTime(Model, rangeStart) {
  return Model.aggregate([
    { $match: { createdAt: { $gte: rangeStart } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: "$_id",
        count: 1,
      },
    },
  ]);
}

async function getSummary(req, res, next) {
  try {
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const today = startOfUtcDay(now);
    const rangeStart = addUtcDays(today, -(TREND_DAYS - 1));

    const [
      totalDoctors,
      totalPatients,
      patientsThisMonth,
      patientsPerDoctor,
      patientsByCondition,
      patientsOverTimeRaw,
      doctorsOverTimeRaw,
    ] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Patient.countDocuments({ createdAt: { $gte: startOfMonth } }),
      getPatientsPerDoctor(),
      getPatientsByCondition(),
      getCreatedOverTime(Patient, rangeStart),
      getCreatedOverTime(Doctor, rangeStart),
    ]);

    const averagePatientsPerDoctor =
      totalDoctors === 0 ? 0 : roundToTwo(totalPatients / totalDoctors);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalDoctors,
          totalPatients,
          patientsThisMonth,
          averagePatientsPerDoctor,
        },
        patientsPerDoctor,
        patientsByCondition,
        patientsOverTime: fillMissingDates(patientsOverTimeRaw, rangeStart, TREND_DAYS),
        doctorsOverTime: fillMissingDates(doctorsOverTimeRaw, rangeStart, TREND_DAYS),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSummary,
};
