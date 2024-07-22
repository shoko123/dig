INSERT INTO `ceramic_base_types` (`id`, `name`) VALUES
(1,'Unassigned'),
(2,'Unknown'),
(3,'Tbd'),
(10,'Vessel/Lid'),
(11,'Lamp'),
(12,'Ceramic Artifcat'),
(13,'Architectural/Installation'),
(14,'Ceramic Production/Waste');

INSERT INTO `ceramics` (`id`, `id_year`, `id_object_no`, `field_description`, `specialist_description`, `notes`, `base_type_id`) VALUES
('22.2', 22, 2, 'nice shred', 'roman lamp', null, 10),
('22.3', 22, 3, 'shred', 'roman lamp', null, 1),
('22.4', 22, 4, 'pot sherd', 'coking pot', null, 1),
('22.5', 22, 5, 'ware', 'amphora', null, 1),
('22.6', 22, 6, 'shred', null, null, 1),
('23.7', 23, 1, 'shred', null, null, 1),
('23.10', 23, 2, 'mud brick', 'unfired brick', null, 1);
