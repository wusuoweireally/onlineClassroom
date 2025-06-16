/*
 Navicat Premium Dump SQL

 Source Server         : 本地mysql
 Source Server Type    : MySQL
 Source Server Version : 90300 (9.3.0)
 Source Host           : localhost:3306
 Source Schema         : classroom_system

 Target Server Type    : MySQL
 Target Server Version : 90300 (9.3.0)
 File Encoding         : 65001

 Date: 14/06/2025 19:06:00
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admins
-- ----------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'admin',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_id` (`admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of admins
-- ----------------------------
BEGIN;
INSERT INTO `admins` (`id`, `admin_id`, `name`, `password`, `email`, `phone`, `role`, `created_at`, `updated_at`) VALUES (1, 'admin', '系统管理员', '$2b$10$AsdY8uTTyhPgQbD5aYkx.e.VNvutQqLu6PKT5DJ/I0ZtWQeTcNoFS', 'admin@school.edu', NULL, 'admin', '2025-06-12 21:18:10', '2025-06-12 21:18:10');
COMMIT;

-- ----------------------------
-- Table structure for questions
-- ----------------------------
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) NOT NULL,
  `student_name` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','answered','closed') DEFAULT 'pending',
  `teacher_reply` text,
  `replied_by` varchar(20) DEFAULT NULL,
  `replied_at` timestamp NULL DEFAULT NULL,
  `priority` enum('low','normal','high') DEFAULT 'normal',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of questions
-- ----------------------------
BEGIN;
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (50, 'ST001', '学生1', '什么是向心加速度？它的定义式是如何推导出来的？', '知识点定义类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:57:33');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (51, 'ST002', '学生2', '牛顿第二定律在斜面滑块问题中应该怎么应用？', '知识点应用类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:57:36');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (52, 'ST003', '学生3', '动能定理和机械能守恒定律之间有什么区别和联系？', '知识点关联类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:57:40');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (53, 'ST004', '学生4', '为什么自由落体实验要在真空中进行？', '现象解释类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:57:43');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (54, 'ST005', '学生5', '如何用弹簧测力计测量物体的重力？具体步骤是什么？', '实验操作类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:57:46');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (55, 'ST006', '学生6', '这道关于圆周运动的题目应该用什么公式来计算？', '知识点应用类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:57:50');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (56, 'ST007', '学生7', '我总是搞不清楚速度和加速度的区别，能解释一下吗？', '知识点关联类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:57:53');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (57, 'ST008', '学生8', '学习物理有什么好的记忆公式的方法吗？', '知识点应用类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:57:56');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (58, 'ST009', '学生9', '电场强度的定义是什么？', '知识点定义类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:57:59');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (59, 'ST010', '学生10', '如何在电路分析中应用欧姆定律？', '知识点应用类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:02');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (60, 'ST011', '学生11', '电场和磁场之间有什么关系？', '知识点关联类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:06');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (61, 'ST012', '学生12', '为什么金属导体在通电时会发热？', '现象解释类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:09');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (62, 'ST013', '学生13', '用万用表测量电阻的正确操作步骤是什么？', '实验操作类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:12');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (63, 'ST014', '学生14', '这道电路功率计算题我不知道从哪里入手？', '疑难困惑类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:15');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (64, 'ST015', '学生15', '为什么并联电路中各支路电压相等？我总是理解不了。', '现象解释类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:17');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (65, 'ST016', '学生16', '怎样才能更好地理解电磁感应现象？', '现象解释类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:20');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (66, 'ST017', '学生17', '什么是波的干涉现象？', '知识点定义类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:24');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (67, 'ST018', '学生18', '声波在空气中的传播速度如何计算？', '知识点应用类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:30');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (68, 'ST019', '学生19', '光的波动性和粒子性之间是什么关系？', '知识点关联类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:30');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (69, 'ST020', '学生20', '为什么会出现多普勒效应？', '现象解释类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:35');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (70, 'ST021', '学生21', '如何用示波器观察声波的波形？', '实验操作类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:38');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (71, 'ST022', '学生22', '关于波长、频率和波速的关系，这道题该怎么解？', '知识点应用类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:42');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (72, 'ST023', '学生23', '我对波的反射和折射现象很困惑，能详细解释一下吗？', '疑难困惑类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:45');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (73, 'ST024', '学生24', '学习波动这一章有什么好的方法和技巧？', '知识点应用类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:48');
INSERT INTO `questions` (`id`, `student_id`, `student_name`, `content`, `category`, `created_at`, `status`, `teacher_reply`, `replied_by`, `replied_at`, `priority`, `updated_at`) VALUES (74, 'ST025', '学生25', '原子核的结构是怎样的？', '知识点定义类问题', '2025-06-13 22:57:10', 'pending', NULL, NULL, NULL, 'normal', '2025-06-13 22:58:52');
COMMIT;

-- ----------------------------
-- Table structure for students
-- ----------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `password` varchar(255) NOT NULL DEFAULT '',
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `class_name` varchar(50) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of students
-- ----------------------------
BEGIN;
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (1, 'ST001', '学生1', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student001@school.edu', NULL, '班级1', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (2, 'ST002', '学生2', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student002@school.edu', NULL, '班级1', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (3, 'ST003', '学生3', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student003@school.edu', NULL, '班级1', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (4, 'ST004', '学生4', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student004@school.edu', NULL, '班级1', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (5, 'ST005', '学生5', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student005@school.edu', NULL, '班级1', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (6, 'ST006', '学生6', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student006@school.edu', NULL, '班级2', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (7, 'ST007', '学生7', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student007@school.edu', NULL, '班级2', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (8, 'ST008', '学生8', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student008@school.edu', NULL, '班级2', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (9, 'ST009', '学生9', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student009@school.edu', NULL, '班级2', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (10, 'ST010', '学生10', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student010@school.edu', NULL, '班级2', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (11, 'ST011', '学生11', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student011@school.edu', NULL, '班级3', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (12, 'ST012', '学生12', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student012@school.edu', NULL, '班级3', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (13, 'ST013', '学生13', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student013@school.edu', NULL, '班级3', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (14, 'ST014', '学生14', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student014@school.edu', NULL, '班级3', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (15, 'ST015', '学生15', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student015@school.edu', NULL, '班级3', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (16, 'ST016', '学生16', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student016@school.edu', NULL, '班级4', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (17, 'ST017', '学生17', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student017@school.edu', NULL, '班级4', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (18, 'ST018', '学生18', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student018@school.edu', NULL, '班级4', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (19, 'ST019', '学生19', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student019@school.edu', NULL, '班级4', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (20, 'ST020', '学生20', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student020@school.edu', NULL, '班级4', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (21, 'ST021', '学生21', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student021@school.edu', NULL, '班级5', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (22, 'ST022', '学生22', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student022@school.edu', NULL, '班级5', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (23, 'ST023', '学生23', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student023@school.edu', NULL, '班级5', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (24, 'ST024', '学生24', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student024@school.edu', NULL, '班级5', '2025-06-13 22:43:28');
INSERT INTO `students` (`id`, `student_id`, `name`, `created_at`, `password`, `email`, `phone`, `class_name`, `updated_at`) VALUES (25, 'ST025', '学生25', '2025-06-11 18:20:45', '$2b$10$V.UwujRmF6SdiALtjGpGcOX6oXXa4MkN0mdqgb3pWwqUBxtpnBZNG', 'student025@school.edu', NULL, '班级5', '2025-06-13 22:43:28');
COMMIT;

-- ----------------------------
-- Table structure for teachers
-- ----------------------------
DROP TABLE IF EXISTS `teachers`;
CREATE TABLE `teachers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_id` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `title` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `teacher_id` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of teachers
-- ----------------------------
BEGIN;
INSERT INTO `teachers` (`id`, `teacher_id`, `name`, `password`, `email`, `phone`, `department`, `title`, `created_at`, `updated_at`) VALUES (1, 'T001', '张老师', '$2b$10$/Kks1EbOqcbaz3m9Qybnm.8Rrtxrd7yRvL/Q4z8uYUoUaY3HnSCG.', 'zhang@school.edu', NULL, '数学系', '教授', '2025-06-12 21:18:10', '2025-06-12 21:18:10');
INSERT INTO `teachers` (`id`, `teacher_id`, `name`, `password`, `email`, `phone`, `department`, `title`, `created_at`, `updated_at`) VALUES (2, 'T002', '李老师', '$2b$10$/Kks1EbOqcbaz3m9Qybnm.8Rrtxrd7yRvL/Q4z8uYUoUaY3HnSCG.', 'li@school.edu', NULL, '物理系', '副教授', '2025-06-12 21:18:10', '2025-06-12 21:18:10');
INSERT INTO `teachers` (`id`, `teacher_id`, `name`, `password`, `email`, `phone`, `department`, `title`, `created_at`, `updated_at`) VALUES (3, 'T003', '王老师', '$2b$10$/Kks1EbOqcbaz3m9Qybnm.8Rrtxrd7yRvL/Q4z8uYUoUaY3HnSCG.', 'wang@school.edu', NULL, '化学系', '讲师', '2025-06-12 21:18:10', '2025-06-12 21:18:10');
COMMIT;

-- ----------------------------
-- Table structure for user_sessions
-- ----------------------------
DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) NOT NULL,
  `user_type` enum('student','teacher','admin') NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id_type` (`user_id`,`user_type`),
  KEY `idx_token_hash` (`token_hash`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of user_sessions
-- ----------------------------
BEGIN;
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (2, 'ST001', 'student', '054d5368be6bd5801779fcc2fd24504c16055aa7293bd932f01b43b7b2ebf4dc', '2025-06-13 21:43:12', '2025-06-12 21:43:11');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (3, 'ST001', 'student', '662f8e4cf63cc8438205e8cb60e7e596d347ac2975a919bb9f85a8fed3b8a996', '2025-06-13 21:43:23', '2025-06-12 21:43:22');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (4, 'ST001', 'student', '25372ada3a21c225da9b8c612ecd7b3e39677b04a176d28fb57b4b001f33ff58', '2025-06-13 21:44:09', '2025-06-12 21:44:08');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (5, 'T001', 'teacher', '8995d60bc21b701b79625702224ff8324d8deca6fd6a36f7f3472441a070903e', '2025-06-13 21:44:09', '2025-06-12 21:44:08');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (8, 'T001', 'teacher', 'b5e807f18c2a2b3b546419ef056a2894eeee7a7a2d07419c7254ac17d7aefd58', '2025-06-13 21:47:48', '2025-06-12 21:47:47');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (9, 'ST001', 'student', '2383fa82b4f7e91ab88075900ce5a630e3283dbc96f83bb98b817cbff2ff3ef7', '2025-06-13 21:50:49', '2025-06-12 21:50:48');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (10, 'T001', 'teacher', '3aedc848b003bbb46bd9e0c85034c93ddc4db7c58a6336ce7df9bab654d5d0c6', '2025-06-13 21:50:49', '2025-06-12 21:50:48');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (12, 'T001', 'teacher', '33ca6f11f6ba673d415518ba5cd096afc5be9b2a27bfad568e0b74f6a2c2ea6c', '2025-06-13 21:55:25', '2025-06-12 21:55:24');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (13, 'T001', 'teacher', '650fa9cce17cc9e609dc68f353b3569970625d8a44ebe78d502e5596c0daf196', '2025-06-13 21:58:16', '2025-06-12 21:58:15');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (14, 'T001', 'teacher', '30eda01e1b93d8b0a6c4a0bd9c3afcb88dfb0157b5f70437210418c0f89b2b76', '2025-06-13 22:17:56', '2025-06-12 22:17:56');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (15, 'T001', 'teacher', '6f3cc7311254d3bbcd2df79a9dc2e121b56033819f9c8646d87565bdf1480e8f', '2025-06-13 22:18:51', '2025-06-12 22:18:50');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (16, 'T001', 'teacher', '3c18c4e32718968db64d4556a6b393aee70a3124a6458eab0faae9622134dd66', '2025-06-13 22:19:56', '2025-06-12 22:19:56');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (20, 'admin', 'admin', '988fd0b66e6bb27363bcfafe4e87ff7b99d40d06ccc52943053542cd42e65186', '2025-06-14 22:53:32', '2025-06-13 22:53:31');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (21, 'admin', 'admin', '03ee1601d23d945cc299384e9ae0ac9c2059d462bdc0a9eac054cea02932fd2f', '2025-06-14 22:55:21', '2025-06-13 22:55:20');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (22, 'admin', 'admin', '162ca2ad27e35f3a3f4240af77a1516fd3083cfee537a8c7e69aac18579b38ad', '2025-06-14 22:58:15', '2025-06-13 22:58:15');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (23, 'admin', 'admin', 'c1a4f9849a92e55b44dbf154e8fffb07d394b6f7fcc63efd921e235003955818', '2025-06-14 23:10:29', '2025-06-13 23:10:29');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (24, 'admin', 'admin', '57cac9f339e0197e258377510e25821cae6321443d6f864d7a6a0d77d14ff8e9', '2025-06-14 23:10:45', '2025-06-13 23:10:44');
INSERT INTO `user_sessions` (`id`, `user_id`, `user_type`, `token_hash`, `expires_at`, `created_at`) VALUES (25, 'admin', 'admin', 'c4da7ca2d77716c8e0dc9cf8dde2519486a0655ea36c42aab6a3f3a222c7b31b', '2025-06-14 23:13:34', '2025-06-13 23:13:33');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
