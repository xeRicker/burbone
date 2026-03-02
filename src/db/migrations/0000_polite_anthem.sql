CREATE TABLE `daily_revenues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`location_id` int NOT NULL,
	`report_date` date NOT NULL,
	`total_revenue` decimal(10,2) NOT NULL,
	`card_revenue` decimal(10,2) NOT NULL DEFAULT '0',
	CONSTRAINT `daily_revenues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`hourly_rate` decimal(10,2) NOT NULL DEFAULT '29.00',
	`icon` varchar(100) NOT NULL DEFAULT 'User',
	`color` varchar(50) NOT NULL DEFAULT '#D35400',
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `inventory_levels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int NOT NULL,
	`location_id` int NOT NULL,
	`report_date` date NOT NULL,
	`quantity` int NOT NULL,
	CONSTRAINT `inventory_levels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL DEFAULT '',
	`icon` varchar(100) NOT NULL DEFAULT 'MapPin',
	`color` varchar(50) NOT NULL DEFAULT '#D35400',
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`),
	CONSTRAINT `locations_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(255) NOT NULL DEFAULT 'Inne',
	`type` varchar(50) NOT NULL DEFAULT 'amount',
	`icon` varchar(100) NOT NULL DEFAULT 'Package',
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `work_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`location_id` int NOT NULL,
	`report_date` date NOT NULL,
	`hours_worked` decimal(5,2) NOT NULL,
	CONSTRAINT `work_logs_id` PRIMARY KEY(`id`)
);
