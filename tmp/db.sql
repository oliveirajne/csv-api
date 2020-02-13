CREATE SCHEMA IF NOT EXISTS `api-csv` DEFAULT CHARACTER SET utf8 ;
USE `api-csv` ;

CREATE TABLE IF NOT EXISTS `api-csv`.`users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `_id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `data_sent` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `api-csv`.`clients` (
  `_id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL,
  `CEP` INT(8) NULL,
  `CPF` INT(11) NULL,
  `data_sent` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `district` VARCHAR(255) NULL,
  `street` VARCHAR(255) NULL,
  `state` VARCHAR(255) NULL,
  `users_id` INT(11) NOT NULL,
  PRIMARY KEY (`_id`),
  INDEX `fk_clients_users_idx` (`users_id` ASC),
  CONSTRAINT `fk_clients_users`
    FOREIGN KEY (`users_id`)
    REFERENCES `api-csv`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

