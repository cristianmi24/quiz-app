CREATE TABLE IF NOT EXISTS participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellidos VARCHAR(255) NOT NULL,
  semestre VARCHAR(10) NOT NULL,
  genero VARCHAR(50) NOT NULL,
  total_time INT NOT NULL,
  total_correct INT NOT NULL,
  completed_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participant_id INT NOT NULL,
  question_index INT NOT NULL,
  answer CHAR(1) NOT NULL,
  is_correct TINYINT(1) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (participant_id) REFERENCES participants(id)
);

CREATE TABLE IF NOT EXISTS question_times (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participant_id INT NOT NULL,
  question_index INT NOT NULL,
  seconds INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (participant_id) REFERENCES participants(id)
);


