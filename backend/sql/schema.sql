
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `sms` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `sms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admission` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `admission_year` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_by` int(11) NOT NULL COMMENT 'current user login',
  `created_at` datetime NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendance` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` int(10) unsigned NOT NULL,
  `subject_enroll_id` int(10) unsigned NOT NULL,
  `status_type` int(10) unsigned NOT NULL,
  `remake` varchar(255) DEFAULT NULL,
  `attendance_date` date NOT NULL,
  `modified_by` int(11) NOT NULL COMMENT 'Current login user',
  `marked_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `attendance_status_type_foreign` (`status_type`),
  KEY `attendance_major_enroll_id_foreign` (`subject_enroll_id`),
  KEY `attendance_student_id_foreign` (`student_id`),
  CONSTRAINT `attendance_major_enroll_id_foreign` FOREIGN KEY (`subject_enroll_id`) REFERENCES `subject_enrollment` (`id`),
  CONSTRAINT `attendance_status_type_foreign` FOREIGN KEY (`status_type`) REFERENCES `attendance_status_type` (`id`),
  CONSTRAINT `attendance_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendance_status_type` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `typs` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `batch` (
  `Id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `batch_code` varchar(255) NOT NULL,
  `program_id` int(10) unsigned NOT NULL,
  `academic_year` int(11) NOT NULL,
  `admission_id` int(10) unsigned NOT NULL,
  `create_by` int(10) unsigned NOT NULL COMMENT 'current user login',
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`Id`),
  UNIQUE KEY `batch_batch_code_unique` (`batch_code`),
  KEY `batch_program_id_foreign` (`program_id`),
  KEY `batch_admission_id_foreign` (`admission_id`),
  CONSTRAINT `batch_admission_id_foreign` FOREIGN KEY (`admission_id`) REFERENCES `admission` (`id`),
  CONSTRAINT `batch_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `communes` (
  `no` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id` varchar(100) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `district_id` varchar(100) NOT NULL,
  PRIMARY KEY (`no`)
) ENGINE=InnoDB AUTO_INCREMENT=1867 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `degree_level` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `degree` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `department` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `department_name` varchar(255) NOT NULL,
  `staff_id` int(10) unsigned NOT NULL COMMENT 'dean id',
  PRIMARY KEY (`id`),
  KEY `department_staff_id_foreign` (`staff_id`),
  CONSTRAINT `department_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `districts` (
  `no` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id` varchar(50) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `province_id` varchar(50) NOT NULL,
  PRIMARY KEY (`no`)
) ENGINE=InnoDB AUTO_INCREMENT=215 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fee_payment` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` int(10) unsigned NOT NULL,
  `amount` decimal(8,2) NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `pay_date` date NOT NULL,
  `make_by` int(10) unsigned NOT NULL,
  `pay_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fee_payment_make_by_foreign` (`make_by`),
  KEY `fee_payment_student_id_foreign` (`student_id`),
  CONSTRAINT `fee_payment_make_by_foreign` FOREIGN KEY (`make_by`) REFERENCES `staff` (`Id`),
  CONSTRAINT `fee_payment_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grade` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `subject_enroll_id` int(10) unsigned NOT NULL,
  `student_id` int(10) unsigned NOT NULL,
  `grade_type_id` int(10) unsigned NOT NULL,
  `score` int(11) NOT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `grade_by` int(10) unsigned NOT NULL,
  `grade_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `grade_grade_type_id_foreign` (`grade_type_id`),
  KEY `grade_major_enroll_id_foreign` (`subject_enroll_id`),
  KEY `grade_student_id_foreign` (`student_id`),
  KEY `fk_grade_teacher` (`grade_by`),
  CONSTRAINT `fk_grade_teacher` FOREIGN KEY (`grade_by`) REFERENCES `teacher` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `grade_grade_type_id_foreign` FOREIGN KEY (`grade_type_id`) REFERENCES `grade_type` (`id`),
  CONSTRAINT `grade_major_enroll_id_foreign` FOREIGN KEY (`subject_enroll_id`) REFERENCES `subject_enrollment` (`id`),
  CONSTRAINT `grade_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grade_type` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `grade_type` varchar(255) NOT NULL,
  `max_score` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `image_schedule` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `batch_id` int(10) unsigned NOT NULL,
  `image` longtext DEFAULT NULL,
  `semester` varchar(100) NOT NULL,
  `upload_date` datetime NOT NULL DEFAULT current_timestamp(),
  `create_by` int(11) NOT NULL COMMENT 'current user login',
  PRIMARY KEY (`id`),
  KEY `batch_id` (`batch_id`),
  CONSTRAINT `fk_image_schedule_batch` FOREIGN KEY (`batch_id`) REFERENCES `batch` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `parent_code` varchar(255) NOT NULL COMMENT 'auto generate',
  `mother_name` varchar(255) NOT NULL,
  `mother_occupation` varchar(255) DEFAULT NULL,
  `mother_phone` int(11) NOT NULL,
  `mother_status` enum('alive','deceased') NOT NULL DEFAULT 'alive',
  `father_name` varchar(255) NOT NULL,
  `father_occupation` varchar(255) DEFAULT NULL,
  `father_phone` int(11) NOT NULL,
  `father_status` enum('alive','deceased') NOT NULL DEFAULT 'alive',
  `province_no` int(10) unsigned NOT NULL,
  `district_no` int(10) unsigned NOT NULL,
  `commune_no` int(10) unsigned NOT NULL,
  `village_no` int(10) unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `parent_parent_code_unique` (`parent_code`),
  KEY `parent_commune_no_foreign` (`commune_no`),
  KEY `parent_district_no_foreign` (`district_no`),
  KEY `parent_province_no_foreign` (`province_no`),
  KEY `parent_village_no_foreign` (`village_no`),
  KEY `parent_user_id_foreign` (`user_id`),
  CONSTRAINT `parent_commune_no_foreign` FOREIGN KEY (`commune_no`) REFERENCES `communes` (`no`),
  CONSTRAINT `parent_district_no_foreign` FOREIGN KEY (`district_no`) REFERENCES `districts` (`no`),
  CONSTRAINT `parent_province_no_foreign` FOREIGN KEY (`province_no`) REFERENCES `provinces` (`no`),
  CONSTRAINT `parent_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `parent_village_no_foreign` FOREIGN KEY (`village_no`) REFERENCES `villages` (`no`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `position` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `position` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `code` varchar(20) NOT NULL,
  `department_id` int(10) unsigned NOT NULL,
  `degree_id` int(10) unsigned NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `programs_name_unique` (`name`),
  KEY `programs_department_id_foreign` (`department_id`),
  KEY `programs_degree_id_foreign` (`degree_id`),
  CONSTRAINT `programs_degree_id_foreign` FOREIGN KEY (`degree_id`) REFERENCES `degree_level` (`id`),
  CONSTRAINT `programs_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `provinces` (
  `no` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id` varchar(50) NOT NULL,
  `country_id` varchar(50) NOT NULL,
  `region_type_id` varchar(50) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`no`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `permissions` longtext DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `scholarship_type` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `scholarship` varchar(255) NOT NULL,
  `fee` decimal(8,2) NOT NULL,
  `modified_by` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `create_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sitting` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `system_title` varchar(255) NOT NULL,
  `system_address` text NOT NULL,
  `sys_phone` bigint(20) NOT NULL,
  `system_email` varchar(255) NOT NULL,
  `system_language` varchar(255) NOT NULL,
  `system_runnign_year` date NOT NULL,
  `system_logo` longtext DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff` (
  `Id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `eng_name` varchar(255) NOT NULL,
  `khmer_name` varchar(255) NOT NULL,
  `phone` int(11) NOT NULL,
  `province_no` int(10) unsigned NOT NULL,
  `district_no` int(10) unsigned NOT NULL,
  `commune_no` int(10) unsigned NOT NULL,
  `village_no` int(10) unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`Id`),
  KEY `staff_village_no_foreign` (`village_no`),
  KEY `staff_user_id_foreign` (`user_id`),
  KEY `staff_province_no_foreign` (`province_no`),
  KEY `staff_commune_no_foreign` (`commune_no`),
  KEY `staff_district_no_foreign` (`district_no`),
  CONSTRAINT `staff_commune_no_foreign` FOREIGN KEY (`commune_no`) REFERENCES `communes` (`no`),
  CONSTRAINT `staff_district_no_foreign` FOREIGN KEY (`district_no`) REFERENCES `districts` (`no`),
  CONSTRAINT `staff_province_no_foreign` FOREIGN KEY (`province_no`) REFERENCES `provinces` (`no`),
  CONSTRAINT `staff_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `staff_village_no_foreign` FOREIGN KEY (`village_no`) REFERENCES `villages` (`no`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `student_code` varchar(255) NOT NULL COMMENT 'auto generate (department_code + batch + id)',
  `std_eng_name` varchar(255) NOT NULL,
  `std_khmer_name` varchar(255) NOT NULL,
  `gender` enum('0','1') NOT NULL COMMENT '0 is men,1 is women',
  `schoolarship_id` bigint(20) unsigned DEFAULT NULL,
  `department_id` int(10) unsigned NOT NULL,
  `program_id` int(10) unsigned NOT NULL,
  `batch_id` int(10) unsigned NOT NULL,
  `dob` date NOT NULL,
  `from_high_school` varchar(255) NOT NULL,
  `nationality` varchar(255) NOT NULL,
  `race` varchar(255) NOT NULL,
  `marital_status` enum('1','0') NOT NULL DEFAULT '0' COMMENT '0 is single,1 is marital',
  `phone` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `parent_id` int(10) unsigned NOT NULL,
  `province_no` int(10) unsigned NOT NULL,
  `district_no` int(10) unsigned NOT NULL,
  `commune_no` int(10) unsigned NOT NULL,
  `village_no` int(10) unsigned NOT NULL,
  `std_status_id` int(10) unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_student_code_unique` (`student_code`),
  KEY `student_program_id_foreign` (`program_id`),
  KEY `student_parent_id_foreign` (`parent_id`),
  KEY `student_province_no_foreign` (`province_no`),
  KEY `student_commune_no_foreign` (`commune_no`),
  KEY `student_schoolarship_id_foreign` (`schoolarship_id`),
  KEY `student_district_no_foreign` (`district_no`),
  KEY `student_user_id_foreign` (`user_id`),
  KEY `student_std_status_id_foreign` (`std_status_id`),
  KEY `student_department_id_foreign` (`department_id`),
  KEY `student_village_no_foreign` (`village_no`),
  KEY `student_batch_id_foreign` (`batch_id`),
  CONSTRAINT `student_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `batch` (`Id`),
  CONSTRAINT `student_commune_no_foreign` FOREIGN KEY (`commune_no`) REFERENCES `communes` (`no`),
  CONSTRAINT `student_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`),
  CONSTRAINT `student_district_no_foreign` FOREIGN KEY (`district_no`) REFERENCES `districts` (`no`),
  CONSTRAINT `student_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `parent` (`id`),
  CONSTRAINT `student_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`),
  CONSTRAINT `student_province_no_foreign` FOREIGN KEY (`province_no`) REFERENCES `provinces` (`no`),
  CONSTRAINT `student_schoolarship_id_foreign` FOREIGN KEY (`schoolarship_id`) REFERENCES `scholarship_type` (`id`),
  CONSTRAINT `student_std_status_id_foreign` FOREIGN KEY (`std_status_id`) REFERENCES `student_status` (`id`),
  CONSTRAINT `student_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `student_village_no_foreign` FOREIGN KEY (`village_no`) REFERENCES `villages` (`no`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_enrollment` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `student_id` int(10) unsigned NOT NULL,
  `acadimic_year` int(11) NOT NULL,
  `batch_id` int(10) unsigned NOT NULL,
  `from_year` int(11) NOT NULL,
  `to_year` int(11) NOT NULL,
  `from_semester` int(11) NOT NULL,
  `to_semester` int(11) NOT NULL,
  `make_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `enroll_date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `student_enrollment_student_id_foreign` (`student_id`),
  KEY `student_enrollment_batch_id_foreign` (`batch_id`),
  CONSTRAINT `student_enrollment_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `batch` (`Id`),
  CONSTRAINT `student_enrollment_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_status` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `std_status` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subject` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `subject_code` varchar(255) NOT NULL,
  `subject_name` varchar(255) NOT NULL,
  `program_id` int(10) unsigned NOT NULL,
  `credit` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `major_major_code_unique` (`subject_code`),
  UNIQUE KEY `major_major_name_unique` (`subject_name`),
  KEY `major_program_id_foreign` (`program_id`),
  CONSTRAINT `major_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subject_enroll_status` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `status_type` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subject_enrollment` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `program_id` int(10) unsigned NOT NULL,
  `subject_id` int(10) unsigned NOT NULL,
  `teacher_id` int(10) unsigned NOT NULL,
  `batch_id` int(10) unsigned NOT NULL,
  `semester` enum('1','2') NOT NULL,
  `status` int(10) unsigned NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `major_enrollment_teacher_id_foreign` (`teacher_id`),
  KEY `major_enrollment_program_id_foreign` (`program_id`),
  KEY `major_enrollment_status_foreign` (`status`),
  KEY `major_enrollment_major_id_foreign` (`subject_id`),
  KEY `major_enrollment_batch_id_foreign` (`batch_id`),
  CONSTRAINT `major_enrollment_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `batch` (`Id`),
  CONSTRAINT `major_enrollment_major_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`id`),
  CONSTRAINT `major_enrollment_program_id_foreign` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`),
  CONSTRAINT `major_enrollment_status_foreign` FOREIGN KEY (`status`) REFERENCES `subject_enroll_status` (`id`),
  CONSTRAINT `major_enrollment_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `eng_name` varchar(255) NOT NULL,
  `khmer_name` varchar(255) NOT NULL,
  `phone` int(11) NOT NULL,
  `teacher_types_id` int(10) unsigned NOT NULL,
  `position` int(10) unsigned NOT NULL,
  `department_id` int(10) unsigned NOT NULL,
  `province_no` int(10) unsigned NOT NULL,
  `district_no` int(10) unsigned NOT NULL,
  `commune_no` int(10) unsigned NOT NULL,
  `village_no` int(10) unsigned NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `teacher_user_id_foreign` (`user_id`),
  KEY `teacher_teacher_types_id_foreign` (`teacher_types_id`),
  KEY `teacher_commune_no_foreign` (`commune_no`),
  KEY `teacher_position_foreign` (`position`),
  KEY `teacher_department_id_foreign` (`department_id`),
  KEY `teacher_village_no_foreign` (`village_no`),
  KEY `teacher_province_no_foreign` (`province_no`),
  KEY `teacher_district_no_foreign` (`district_no`),
  CONSTRAINT `teacher_commune_no_foreign` FOREIGN KEY (`commune_no`) REFERENCES `communes` (`no`),
  CONSTRAINT `teacher_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`),
  CONSTRAINT `teacher_district_no_foreign` FOREIGN KEY (`district_no`) REFERENCES `districts` (`no`),
  CONSTRAINT `teacher_position_foreign` FOREIGN KEY (`position`) REFERENCES `position` (`id`),
  CONSTRAINT `teacher_province_no_foreign` FOREIGN KEY (`province_no`) REFERENCES `provinces` (`no`),
  CONSTRAINT `teacher_teacher_types_id_foreign` FOREIGN KEY (`teacher_types_id`) REFERENCES `teacher_types` (`id`),
  CONSTRAINT `teacher_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `teacher_village_no_foreign` FOREIGN KEY (`village_no`) REFERENCES `villages` (`no`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher_types` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `types` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(10) unsigned DEFAULT NULL,
  `department_id` int(10) unsigned DEFAULT NULL,
  `Image` longtext DEFAULT NULL,
  `status` enum('1','0') NOT NULL DEFAULT '1',
  `create_by` int(11) DEFAULT NULL COMMENT 'current user login',
  `update_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_id_foreign` (`role_id`),
  CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `villages` (
  `no` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id` varchar(100) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `commune_id` varchar(100) NOT NULL,
  PRIMARY KEY (`no`)
) ENGINE=InnoDB AUTO_INCREMENT=16856 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

