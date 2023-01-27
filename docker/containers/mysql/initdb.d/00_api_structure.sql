
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `media_chat`
--

-- --------------------------------------------------------

--
-- Table structure for table `text_rooms`
--

CREATE TABLE `text_rooms` (
    `id` int(10) UNSIGNED NOT NULL,
    `user_id` int(11) NOT NULL,
    `created` datetime NOT NULL,
    `updated` datetime DEFAULT NULL,
    `enabled` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
    `active` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
    `deleted` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
    `secret` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `pin` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `is_private` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
    `history` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
    `post` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `permanent` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
    `description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



INSERT INTO `text_rooms` (`id`, `user_id`, `created`, `updated`, `enabled`, `active`, `deleted`, `secret`, `pin`, `is_private`, `history`, `post`, `permanent`, `description`) VALUES
    (1234, 1, '2022-01-01 00:00:01', NULL, 1, 1, 0, 'adminpwd', '', 0, 100, NULL, 0, 'default demo room');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
    `id` int(11) NOT NULL,
    `created` datetime NOT NULL,
    `username` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
    `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `type` smallint(6) NOT NULL,
    `disabled` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `created`, `username`, `password`, `type`, `disabled`) VALUES
    (1, '2022-05-30 14:10:45', 'andrew@cc.lan', '$2y$13$UQJ7lAh4TWTkobL7zoBhFOyeKfMFUWSvN5r4E0UQMFADAYerUW9ZS', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users_log`
--

CREATE TABLE `users_log` (
     `id` int(10) UNSIGNED NOT NULL,
     `user_id` int(11) NOT NULL,
     `date` datetime NOT NULL,
     `type` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `video_rooms`
--

CREATE TABLE `video_rooms` (
    `id` int(10) UNSIGNED NOT NULL,
    `user_id` int(11) NOT NULL,
    `created` datetime NOT NULL,
    `updated` datetime DEFAULT NULL,
    `active` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
    `deleted` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
    `secret` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `pin` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `private` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
    `history` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
    `post` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `permanent` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
    `description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `text_rooms`
--
ALTER TABLE `text_rooms`
    ADD PRIMARY KEY (`id`),
    ADD KEY `idx_user_id` (`user_id`),
    ADD KEY `idx_deleted` (`deleted`) USING BTREE;

--
-- Indexes for table `users`
--
ALTER TABLE `users`
    ADD PRIMARY KEY (`id`),
    ADD UNIQUE KEY `uniq_username` (`username`);

--
-- Indexes for table `users_log`
--
ALTER TABLE `users_log`
    ADD PRIMARY KEY (`id`),
    ADD KEY `idx_user_id` (`user_id`) USING BTREE;

--
-- Indexes for table `video_rooms`
--
ALTER TABLE `video_rooms`
    ADD PRIMARY KEY (`id`),
    ADD KEY `idx_user_id` (`user_id`),
    ADD KEY `idx_deleted` (`deleted`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `text_rooms`
--
ALTER TABLE `text_rooms`
    MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users_log`
--
ALTER TABLE `users_log`
    MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `video_rooms`
--
ALTER TABLE `video_rooms`
    MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `text_rooms`
--
ALTER TABLE `text_rooms`
    ADD CONSTRAINT `text_rooms_ibfk_userid` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `users_log`
--
ALTER TABLE `users_log`
    ADD CONSTRAINT `users_log_ibfk_userid` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);


COMMIT;
