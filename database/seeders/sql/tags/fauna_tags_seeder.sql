INSERT INTO `fauna_tag_groups` VALUES 
-- base taxon --
(1,'Mammal',1),
(2,'Bird',1),
-- element
(10,'Life Stage',1),
(11,'Symmetry',1),
(12,'Fusion',1),
(13,'Breakage', 1),
(14,'D&R (Grant 1982)',1),
(15,'Weathering (Behrensmeyer 1978)',1),
(20,'Bone Name',1),
(70,'Tooth Name',1),
(71,'Tooth Age',1),
(72,'Tooth Wear',1);

INSERT INTO `fauna_tags` VALUES 
(11,'Sheep (Ovis)',1,1),
(12,'Goat (Capra)',1,1),
(13,'Sheep/Goat (Ovis/Capra)',1,1),
(200,'Cattle (Bos)',1,1),
(201,'Bos Primigenius',1,1),
(300,'Horse (Equid)',1,1),
(400,'Wolf/Dog/Jackle (Canis)',1,1),
(500,'Pig/Boar (Sus)',1,1),
(600,'Persian fallow deer (Dama)',1,1),
(601,'Antelope (Gazelle)',1,1),
(700,'Hare (Lepus)',1,1),
(701,'Rock Hyrax (Procavia Capensis)',1,1),
(800,'Badger (Meles Meles)',1,1),
(900,'Mice (Mus)',1,1),
(901,'Rat (Rattus Ratus)',1,1),
(902,'Mole rat (Spalax)',1,1),
(1000,'Cat (Felis)',1,1),
(1100, 'Medium Mammal',1,1),
(1110, 'Microfauna (Small Mammal)',1,1),

(2100,'Laughing dove (Spilopelia senegalensis)',2,1),
(2101,'Pigeon (Columbida)',2,1),
(2110,'Chicken (Gallus Gallus Domesticus)',2,1),
(2120,'Goose (Anser)',2,1),
(2130,'Partridge',2,1),
(2140,'White-Spectacled Bulbul (Pycnonotus Xanthopygos)',2,1),
(2200,'Short-Toed Snake Eagle (Circaetus Gallicus)',2,1),

-- element attributes
(3000,'Secondary Use',10,1),
(3001,'Butchery',10,1),
(3002,'Burning',10,1),
(3003,'Other BSM',10,1),
(3011,'Left',11,1),
(3012,'Right',11,1),
(3020,'Fused',12,1),
(3021,'Unfused',12,1),
(3030,'Green',13,1),
(3031,'Dry',13,1),
(3032,'Mixed',13,1),
(3033,'Modern Damage',13,1),
(3041,'1',14,1),-- d&r
(3042,'2',14,1),
(3043,'3',14,1),
(3044,'4',14,1),
(3045,'5',14,1),
(3046,'6',14,1),
(3047,'7',14,1),
(3048,'8',14,1),
(3049,'9',14,1),
(3050,'10',14,1),
(3051,'11',14,1),
(3052,'Comp',14,1),

(3061,'1',15,1),-- weathering
(3062,'2',15,1),
(3063,'3',15,1),
(3064,'4',15,1),
(3065,'5',15,1),
-- bones
(3112,'Cranial',20,1),
(3113,'Mandibular',20,2),
(3114,'Maxillary',20,3),
(3121,'Vertebra',20,2),
(3122,'Sternum',20,2),
(3123,'Rib',20,3),
(3131,'Scapula',20,2),
(3132,'Humerus',20,2),
(3133,'Radius',20,2),
(3134,'Ulna',20,2),
(3141,'Femur',20,2),
(3142,'Tibia',20,3),
(3143,'Patella',20,2),
(3151,'Metapodial',20,3),
(3152,'Metacarpal',20,3),
(3153,'Metatarsal',20,3),
(3154,'Phalanx',20,3),
(3155,'Talus (Astragulus)',20,3),
(3156,'Calcanous',20,3),
-- bird bones
(3200,'Furcula',20,1),
(3201,'Coracoid',20,1),
(3202,'Keel',20,1),
(3203,'Alula',20,1),
-- tooth name
(4003,'M1/M2',70,3),
(4004,'M1',70,4),
(4005,'M2',70,4),
(4006,'M3',70,4),
(4007,'P2',70,4),
(4008,'P3',70,4),
(4009,'P4',70,4),
(4010,'Incisor',70,1),
(4011,'Canine',70,2),
-- tooth type
(4015,'Erupting',71,1),
(4016,'Deciduous',71,1),
-- tooth ware
(4021,'a',72,1),
(4022,'b',72,1),
(4023,'c',72,1),
(4024,'d',72,1),
(4025,'e',72,1),
(4026,'f',72,1),
(4027,'g',72,1),
(4028,'h',72,1);