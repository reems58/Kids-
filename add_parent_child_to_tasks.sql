-- إضافة عمودين parent_id و child_id إلى جدول tasks
USE kids_learning;

-- إضافة عمود parent_id
ALTER TABLE tasks 
ADD COLUMN parent_id INT(11) DEFAULT NULL AFTER task_id;

-- إضافة عمود child_id
ALTER TABLE tasks 
ADD COLUMN child_id INT(11) DEFAULT NULL AFTER parent_id;

-- إضافة فهرس لـ parent_id
ALTER TABLE tasks 
ADD INDEX parent_id_idx (parent_id);

-- إضافة فهرس لـ child_id
ALTER TABLE tasks 
ADD INDEX child_id_idx (child_id);

-- إضافة المفتاح الخارجي لـ parent_id
ALTER TABLE tasks 
ADD CONSTRAINT fk_tasks_parent 
FOREIGN KEY (parent_id) REFERENCES parents (id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- إضافة المفتاح الخارجي لـ child_id
ALTER TABLE tasks 
ADD CONSTRAINT fk_tasks_child 
FOREIGN KEY (child_id) REFERENCES children (child_id) 
ON DELETE SET NULL ON UPDATE CASCADE;


