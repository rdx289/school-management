-- =====================================================
-- SCHOOL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =====================================================
-- Run this file to set up the complete database
-- mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS school_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE school_management;

-- =====================================================
-- USERS TABLE (Authentication for all roles)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- CLASSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL,
  capacity INT DEFAULT 40,
  room_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_class_section (name, section)
);

-- =====================================================
-- SUBJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TEACHERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS teachers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  teacher_id VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  subject VARCHAR(100),
  qualification VARCHAR(200),
  joining_date DATE,
  address TEXT,
  gender ENUM('male', 'female', 'other'),
  dob DATE,
  salary DECIMAL(10,2),
  photo VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- CLASS-TEACHER ASSIGNMENT
-- =====================================================
CREATE TABLE IF NOT EXISTS class_teachers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  teacher_id INT NOT NULL,
  subject_id INT,
  is_class_teacher BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- =====================================================
-- STUDENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  student_id VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  dob DATE,
  gender ENUM('male', 'female', 'other'),
  class_id INT,
  phone VARCHAR(20),
  email VARCHAR(150),
  address TEXT,
  parent_name VARCHAR(150),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(150),
  parent_occupation VARCHAR(100),
  admission_date DATE DEFAULT (CURDATE()),
  blood_group VARCHAR(5),
  photo VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- =====================================================
-- ATTENDANCE TABLE (Students)
-- =====================================================
CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'excused') NOT NULL DEFAULT 'present',
  remarks VARCHAR(255),
  marked_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_attendance (student_id, date)
);

-- =====================================================
-- TEACHER ATTENDANCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS teacher_attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late', 'on_leave') NOT NULL DEFAULT 'present',
  remarks VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_teacher_attendance (teacher_id, date)
);

-- =====================================================
-- EXAMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  exam_type ENUM('unit_test', 'midterm', 'final', 'practical', 'other') NOT NULL,
  class_id INT,
  subject_id INT,
  exam_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  total_marks INT NOT NULL DEFAULT 100,
  passing_marks INT NOT NULL DEFAULT 35,
  description TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- RESULTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT NOT NULL,
  student_id INT NOT NULL,
  marks_obtained DECIMAL(5,2),
  grade VARCHAR(5),
  remarks VARCHAR(255),
  is_pass BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY unique_result (exam_id, student_id)
);

-- =====================================================
-- FEE STRUCTURE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS fee_structure (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT,
  fee_type VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  frequency ENUM('monthly', 'quarterly', 'annually', 'one_time') NOT NULL,
  academic_year VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- =====================================================
-- FEES TABLE (Fee Payments)
-- =====================================================
CREATE TABLE IF NOT EXISTS fees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  fee_type VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  fine DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_date DATE,
  due_date DATE,
  payment_method ENUM('cash', 'online', 'cheque', 'bank_transfer') DEFAULT 'cash',
  status ENUM('paid', 'pending', 'partial', 'overdue') DEFAULT 'pending',
  receipt_number VARCHAR(50) UNIQUE,
  academic_year VARCHAR(20),
  month VARCHAR(20),
  collected_by INT,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (collected_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TIMETABLE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS timetable (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  teacher_id INT NOT NULL,
  day_of_week ENUM('monday','tuesday','wednesday','thursday','friday','saturday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- =====================================================
-- NOTICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  audience ENUM('all', 'students', 'teachers', 'parents') DEFAULT 'all',
  publish_date DATE DEFAULT (CURDATE()),
  expiry_date DATE,
  posted_by INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- SEED DATA - Default Admin User
-- Password: Admin@123 (bcrypt hashed)
-- =====================================================
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@school.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('john.teacher', 'john@school.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher'),
('alice.student', 'alice@student.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student');

-- Seed Classes
INSERT INTO classes (name, section, capacity, room_number) VALUES
('Grade 1', 'A', 40, 'R-101'),
('Grade 1', 'B', 40, 'R-102'),
('Grade 2', 'A', 40, 'R-201'),
('Grade 3', 'A', 40, 'R-301'),
('Grade 4', 'A', 40, 'R-401'),
('Grade 5', 'A', 40, 'R-501'),
('Grade 6', 'A', 40, 'R-601'),
('Grade 7', 'A', 40, 'R-701'),
('Grade 8', 'A', 40, 'R-801'),
('Grade 9', 'A', 40, 'R-901'),
('Grade 10', 'A', 40, 'R-1001');

-- Seed Subjects
INSERT INTO subjects (name, code) VALUES
('Mathematics', 'MATH'),
('English', 'ENG'),
('Science', 'SCI'),
('History', 'HIST'),
('Geography', 'GEO'),
('Physics', 'PHY'),
('Chemistry', 'CHEM'),
('Biology', 'BIO'),
('Computer Science', 'CS'),
('Physical Education', 'PE');

-- Seed a teacher
INSERT INTO teachers (user_id, teacher_id, name, email, phone, subject, qualification, joining_date, gender)
VALUES (2, 'TCH-001', 'John Smith', 'john@school.edu', '9876543210', 'Mathematics', 'M.Sc Mathematics', '2020-06-01', 'male');

-- Seed sample notices
INSERT INTO notices (title, content, priority, audience, posted_by) VALUES
('Welcome Back!', 'Welcome to the new academic year 2024-25. We wish all students and staff a productive year ahead.', 'high', 'all', 1),
('Annual Sports Day', 'Annual Sports Day will be held on March 20th. All students are encouraged to participate.', 'normal', 'all', 1),
('Parent-Teacher Meeting', 'PTM scheduled for next Saturday from 9 AM to 1 PM.', 'urgent', 'parents', 1);
