import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const createdAt = () => text("created_at").notNull().default(sql`(datetime('now'))`);

export const doctors = sqliteTable("doctors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(), // pedijatrija | ortodoncija | protetika | opsta
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("doctor"), // admin | doctor
  color: text("color").notNull().default("#22988e"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  nameSr: text("name_sr").notNull(),
  nameEn: text("name_en").notNull(),
  durationMin: integer("duration_min").notNull(),
  priceType: text("price_type").notNull().default("fixed"), // fixed | from | range | free | request
  priceFrom: integer("price_from").notNull().default(0), // RSD
  priceTo: integer("price_to"),
  priceUnitSr: text("price_unit_sr"),
  priceUnitEn: text("price_unit_en"),
  bookingMode: text("booking_mode").notNull().default("instant"), // instant | request
  doctorSlugs: text("doctor_slugs").notNull().default("[]"), // JSON niz slugova doktora koji rade uslugu
  popular: integer("popular", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const patients = sqliteTable(
  "patients",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    guardianName: text("guardian_name"),
    birthYear: integer("birth_year"),
    note: text("note"),
    source: text("source").notNull().default("online"), // online | phone | admin | demo
    lastRecallAt: text("last_recall_at"),
    createdAt: createdAt(),
  },
  (t) => [index("patients_phone_idx").on(t.phone)],
);

export const appointments = sqliteTable(
  "appointments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    token: text("token").notNull().unique(),
    patientId: integer("patient_id")
      .notNull()
      .references(() => patients.id),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id),
    doctorId: integer("doctor_id").references(() => doctors.id),
    date: text("date"), // YYYY-MM-DD, lokalno vreme ordinacije (null dok zahtev nije zakazan)
    startMin: integer("start_min"),
    endMin: integer("end_min"),
    status: text("status").notNull(), // pending | confirmed | completed | cancelled | no_show
    mode: text("mode").notNull(), // instant | request
    source: text("source").notNull().default("online"), // online | phone | admin | demo
    locale: text("locale").notNull().default("sr"),
    patientNote: text("patient_note"),
    internalNote: text("internal_note"),
    preferences: text("preferences"), // JSON {dates: string[], timeOfDay}
    cancelledBy: text("cancelled_by"),
    cancelledAt: text("cancelled_at"),
    reminderSentAt: text("reminder_sent_at"),
    reviewRequestSentAt: text("review_request_sent_at"),
    createdAt: createdAt(),
    updatedAt: text("updated_at"),
  },
  (t) => [
    index("appointments_date_idx").on(t.date),
    index("appointments_doctor_date_idx").on(t.doctorId, t.date),
    index("appointments_patient_idx").on(t.patientId),
    index("appointments_status_idx").on(t.status),
  ],
);

// Urađeni radovi (zaduženje pacijenta)
export const treatments = sqliteTable(
  "treatments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    patientId: integer("patient_id")
      .notNull()
      .references(() => patients.id),
    appointmentId: integer("appointment_id").references(() => appointments.id),
    doctorId: integer("doctor_id").references(() => doctors.id),
    serviceId: integer("service_id").references(() => services.id),
    description: text("description").notNull(),
    tooth: text("tooth"),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: integer("unit_price").notNull(),
    discountPct: integer("discount_pct").notNull().default(0),
    total: integer("total").notNull(),
    date: text("date").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("treatments_patient_idx").on(t.patientId), index("treatments_date_idx").on(t.date)],
);

// Uplate pacijenata
export const payments = sqliteTable(
  "payments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    patientId: integer("patient_id")
      .notNull()
      .references(() => patients.id),
    appointmentId: integer("appointment_id").references(() => appointments.id),
    doctorId: integer("doctor_id").references(() => doctors.id),
    amount: integer("amount").notNull(),
    method: text("method").notNull(), // gotovina | kartica | rate | prenos
    date: text("date").notNull(),
    note: text("note"),
    createdAt: createdAt(),
  },
  (t) => [index("payments_patient_idx").on(t.patientId), index("payments_date_idx").on(t.date)],
);

// Nedeljni raspored doktora (0 = nedelja … 6 = subota)
export const schedules = sqliteTable(
  "schedules",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id),
    weekday: integer("weekday").notNull(),
    startMin: integer("start_min").notNull(),
    endMin: integer("end_min").notNull(),
  },
  (t) => [index("schedules_doctor_idx").on(t.doctorId)],
);

// Odsustva, praznici, blokirana vremena (doctorId = null → cela ordinacija)
export const timeOff = sqliteTable("time_off", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  doctorId: integer("doctor_id").references(() => doctors.id),
  dateFrom: text("date_from").notNull(),
  dateTo: text("date_to").notNull(),
  startMin: integer("start_min"), // null = ceo dan
  endMin: integer("end_min"),
  reason: text("reason"),
  createdAt: createdAt(),
});

// Svi poslati (ili samo zabeleženi) mejlovi
export const emailOutbox = sqliteTable("email_outbox", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  to: text("to_address").notNull(),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  text: text("text").notNull(),
  kind: text("kind").notNull(),
  appointmentId: integer("appointment_id"),
  status: text("status").notNull(), // sent | logged | failed
  error: text("error"),
  createdAt: createdAt(),
});

export type Doctor = typeof doctors.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Treatment = typeof treatments.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Schedule = typeof schedules.$inferSelect;
export type TimeOff = typeof timeOff.$inferSelect;
