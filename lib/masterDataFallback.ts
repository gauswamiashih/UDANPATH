export const DEFAULT_MASTER_EDUCATION_LEVELS = [
  { id: 'f7e8386c-1714-4a37-bb5d-082b35408911', name: 'Class 10', display_order: 1 },
  { id: '9ab80c34-7a80-46ec-bb7c-6c28ae8a8fd8', name: 'Class 11', display_order: 2 },
  { id: '37d42ba0-0820-4dd1-b672-1e452d1174fa', name: 'Class 12', display_order: 3 },
  { id: '64221598-a4a2-4dc7-9ca3-6d7c87097bb2', name: 'ITI', display_order: 4 },
  { id: '0b709780-b5e2-4950-a13b-017fe4b46efe', name: 'Diploma', display_order: 5 },
  { id: 'de8e38fd-6f5c-4032-be90-5a417a914d85', name: 'Undergraduate', display_order: 6 },
  { id: '52796240-19ea-4af9-bdab-eb7e6e23baee', name: 'Post-Graduation', display_order: 7 },
  { id: '4568fa95-afb3-4caa-a645-43d728c35437', name: 'PhD', display_order: 8 }
];

export const DEFAULT_MASTER_STREAMS = [
  { id: '97eca562-730f-45d3-b073-7c5fd3db12bb', education_level_id: '37d42ba0-0820-4dd1-b672-1e452d1174fa', name: 'Science' },
  { id: '8a5f904f-2e1b-4e7c-a031-5f898dc94669', education_level_id: '37d42ba0-0820-4dd1-b672-1e452d1174fa', name: 'Commerce' },
  { id: '91c0da9f-adc6-4586-808f-0c4f47da2cc3', education_level_id: '37d42ba0-0820-4dd1-b672-1e452d1174fa', name: 'Arts / Humanities' },
  { id: 'e7d78125-242d-4086-9501-d9510fa6c059', education_level_id: '37d42ba0-0820-4dd1-b672-1e452d1174fa', name: 'Vocational' }
];

export const DEFAULT_MASTER_DEGREES = [
  // Diploma
  { id: '8446e9c6-d855-4f6d-b004-92a6ccffd3ee', education_level_id: '0b709780-b5e2-4950-a13b-017fe4b46efe', name: 'Diploma in Computer Engineering' },
  { id: '93a4f698-a716-49f2-8922-86113fd72b5f', education_level_id: '0b709780-b5e2-4950-a13b-017fe4b46efe', name: 'Diploma in Mechanical Engineering' },
  { id: 'd6718462-dbf9-4cd1-9a43-39fca50041cf', education_level_id: '0b709780-b5e2-4950-a13b-017fe4b46efe', name: 'Diploma in Civil Engineering' },
  { id: 'd9db26a3-ffd4-4c12-9f0e-7d6111d7978b', education_level_id: '0b709780-b5e2-4950-a13b-017fe4b46efe', name: 'Diploma in Electrical Engineering' },
  { id: '0d632ff6-70fe-444a-9bf7-01bd37440f53', education_level_id: '0b709780-b5e2-4950-a13b-017fe4b46efe', name: 'Diploma in IT' },
  // Undergraduate
  { id: 'db69d405-0f06-44a7-a7b2-0dd8e978811a', education_level_id: 'de8e38fd-6f5c-4032-be90-5a417a914d85', name: 'B.Tech' },
  { id: '0c563efd-d231-439f-a431-660802269314', education_level_id: 'de8e38fd-6f5c-4032-be90-5a417a914d85', name: 'B.E.' },
  { id: 'd232eba9-7188-4106-b117-110804f60bea', education_level_id: 'de8e38fd-6f5c-4032-be90-5a417a914d85', name: 'B.Sc' },
  { id: '2555ed6d-4de5-4798-bba5-8a6f0358d772', education_level_id: 'de8e38fd-6f5c-4032-be90-5a417a914d85', name: 'B.Com' },
  { id: 'bbd63021-4fb8-4f7b-95e0-766505b1b31d', education_level_id: 'de8e38fd-6f5c-4032-be90-5a417a914d85', name: 'B.A.' },
  { id: '9fa3bfff-3ee9-4272-b4ad-f0ac73dd5657', education_level_id: 'de8e38fd-6f5c-4032-be90-5a417a914d85', name: 'BCA' },
  { id: '24a98795-419d-48e3-be9b-12497836cb5d', education_level_id: 'de8e38fd-6f5c-4032-be90-5a417a914d85', name: 'BBA' },
  { id: '147aae3b-561f-462f-9a7c-e1de64a097fe', education_level_id: 'de8e38fd-6f5c-4032-be90-5a417a914d85', name: 'B.Pharm' },
  { id: 'aab83260-96b1-48c7-99cb-5d41fe9532bf', education_level_id: 'de8e38fd-6f5c-4032-be90-5a417a914d85', name: 'LLB' },
  { id: '734e5144-a73c-40bc-8a49-70f5eea795bf', education_level_id: 'de8e38fd-6f5c-4032-be90-5a417a914d85', name: 'MBBS' },
  // Post-Graduation
  { id: 'd44f963d-2aaa-49b9-97f5-3eef4fb0a0d8', education_level_id: '52796240-19ea-4af9-bdab-eb7e6e23baee', name: 'M.Tech' },
  { id: 'ae778b9e-b44e-4fbc-b2ea-63057643296b', education_level_id: '52796240-19ea-4af9-bdab-eb7e6e23baee', name: 'M.E.' },
  { id: 'b63ba064-f5bc-4270-9dc2-6565bf0d888f', education_level_id: '52796240-19ea-4af9-bdab-eb7e6e23baee', name: 'M.Sc' },
  { id: '5ec078a2-7e98-4b6a-b351-7daf11f2d1f0', education_level_id: '52796240-19ea-4af9-bdab-eb7e6e23baee', name: 'M.Com' },
  { id: '1a87f102-4a2a-4270-8566-4cfebff55d38', education_level_id: '52796240-19ea-4af9-bdab-eb7e6e23baee', name: 'M.A.' },
  { id: 'f589432b-bcf3-4350-851a-10466093ba30', education_level_id: '52796240-19ea-4af9-bdab-eb7e6e23baee', name: 'MBA' },
  { id: 'e8617fd6-7823-4d48-996b-b8d45aab16db', education_level_id: '52796240-19ea-4af9-bdab-eb7e6e23baee', name: 'MCA' },
  { id: 'f78c0679-db8e-4a58-b6a1-9f391c7602ce', education_level_id: '52796240-19ea-4af9-bdab-eb7e6e23baee', name: 'LLM' },
  { id: '682313ce-431a-49e8-941b-55c2f5a012c0', education_level_id: '52796240-19ea-4af9-bdab-eb7e6e23baee', name: 'MD/MS' },
  // Class 12
  { id: '4fb2ef43-541d-4af6-9d5c-c32d955fdb61', education_level_id: '37d42ba0-0820-4dd1-b672-1e452d1174fa', name: 'Senior Secondary' }
];

export const DEFAULT_MASTER_BRANCHES = [
  // B.Tech
  { id: '932ed610-6f5c-41fb-a242-53ffa6f3d74e', degree_id: 'db69d405-0f06-44a7-a7b2-0dd8e978811a', name: 'Computer Engineering' },
  { id: 'b596f5e6-1468-466f-ba06-8d678e3e60ac', degree_id: 'db69d405-0f06-44a7-a7b2-0dd8e978811a', name: 'Computer Science' },
  { id: '745a31b8-e5a0-4451-9cb3-d6f32b36b2b4', degree_id: 'db69d405-0f06-44a7-a7b2-0dd8e978811a', name: 'Information Technology' },
  { id: '68618f33-3325-4d45-b445-dfaa9131404f', degree_id: 'db69d405-0f06-44a7-a7b2-0dd8e978811a', name: 'AI & Machine Learning' },
  { id: '2b168d6d-ebbf-45cf-bfe8-ec522cd1eef9', degree_id: 'db69d405-0f06-44a7-a7b2-0dd8e978811a', name: 'Data Science' },
  { id: 'af681c25-28d2-4c84-8eb4-3391975749a2', degree_id: 'db69d405-0f06-44a7-a7b2-0dd8e978811a', name: 'Cyber Security' },
  { id: '0de29b91-99cc-426d-9f3a-da45acdc37b7', degree_id: 'db69d405-0f06-44a7-a7b2-0dd8e978811a', name: 'Electronics & Communication' },
  { id: '07b110f1-93f7-48dd-bdb0-5e9481b0b666', degree_id: 'db69d405-0f06-44a7-a7b2-0dd8e978811a', name: 'Electrical Engineering' },
  { id: 'afee657e-fc4c-47ba-84ce-b604d88aef2f', degree_id: 'db69d405-0f06-44a7-a7b2-0dd8e978811a', name: 'Mechanical Engineering' },
  { id: '8114c31e-0f57-4530-b265-215944566640', degree_id: 'db69d405-0f06-44a7-a7b2-0dd8e978811a', name: 'Civil Engineering' },
  { id: '82bb59f8-3218-47dd-a806-364a74fc89ee', degree_id: 'db69d405-0f06-44a7-a7b2-0dd8e978811a', name: 'Aerospace Engineering' },
  { id: 'e3fb2f46-0300-4a7a-a67c-aaf0f6396362', degree_id: 'db69d405-0f06-44a7-a7b2-0dd8e978811a', name: 'Biotechnology' },
  // B.Sc
  { id: '451dadc9-e35b-473c-97a5-6d11727fcb34', degree_id: 'd232eba9-7188-4106-b117-110804f60bea', name: 'Physics' },
  { id: '4102e9a7-2839-44b3-9bae-03a8952852a8', degree_id: 'd232eba9-7188-4106-b117-110804f60bea', name: 'Chemistry' },
  { id: 'b6d6e511-2b0d-4a65-acb0-79accdd178ce', degree_id: 'd232eba9-7188-4106-b117-110804f60bea', name: 'Mathematics' },
  { id: '4bee7e47-9855-4650-9bc1-14babbfb67af', degree_id: 'd232eba9-7188-4106-b117-110804f60bea', name: 'Computer Science' },
  { id: 'a6c08e9b-01b3-410c-bb07-dd185927b1a1', degree_id: 'd232eba9-7188-4106-b117-110804f60bea', name: 'Biology' },
  { id: '23e4f08b-0ade-4985-a659-8b7a40cf5e35', degree_id: 'd232eba9-7188-4106-b117-110804f60bea', name: 'Statistics' },
  { id: '27a676c4-6ccd-4a2c-947c-0634f1a7e809', degree_id: 'd232eba9-7188-4106-b117-110804f60bea', name: 'IT' },
  // B.Com
  { id: '3f83d516-9392-4a5b-890c-75dc9257b54f', degree_id: '2555ed6d-4de5-4798-bba5-8a6f0358d772', name: 'Accounting' },
  { id: '27f9acb7-6536-4925-b1a6-9421e9bf45fb', degree_id: '2555ed6d-4de5-4798-bba5-8a6f0358d772', name: 'Finance' },
  { id: '91d80433-19fd-4382-a427-0e5075ce7aa0', degree_id: '2555ed6d-4de5-4798-bba5-8a6f0358d772', name: 'Banking' },
  { id: '8455f0fc-47ae-431e-a010-7ad8b90fe761', degree_id: '2555ed6d-4de5-4798-bba5-8a6f0358d772', name: 'Business' },
  // Senior Secondary
  { id: '6c0e6c99-745b-45f1-b5d5-61cb00958cff', degree_id: '4fb2ef43-541d-4af6-9d5c-c32d955fdb61', name: 'PCM' },
  { id: '1bc4914c-5ce3-4d4d-8ac8-f76a108e37af', degree_id: '4fb2ef43-541d-4af6-9d5c-c32d955fdb61', name: 'PCB' },
  { id: '0b11b16f-59f8-4618-8707-4c1736433fa5', degree_id: '4fb2ef43-541d-4af6-9d5c-c32d955fdb61', name: 'PCMB' }
];

export const DEFAULT_MASTER_INTERESTS = [
  { id: 'f0234407-53f6-4644-aa2a-a023cf01688c', category: 'TECHNOLOGY', name: 'IT' },
  { id: 'd9b9d132-aebe-4b91-963b-faf5b472de8e', category: 'TECHNOLOGY', name: 'Software Development' },
  { id: '0c4c47a8-cef1-4103-b016-13c07617a543', category: 'TECHNOLOGY', name: 'AI / ML' },
  { id: '86c2e52c-fd9a-42bc-bc53-7118e12287d7', category: 'TECHNOLOGY', name: 'Data Science' },
  { id: '0a70a057-f801-45e9-a5de-33a7efe0d42f', category: 'TECHNOLOGY', name: 'Cyber Security' },
  { id: 'a005b93b-c5c2-49d3-8783-4a207fb74e92', category: 'GOVERNMENT', name: 'Government Jobs' },
  { id: '1f31dca7-0248-434c-8b15-818b7050a8ae', category: 'GOVERNMENT', name: 'Civil Services' },
  { id: '4a700252-7ea9-46a7-bc91-648f34cb3a1c', category: 'GOVERNMENT', name: 'PSU' },
  { id: '3dd07e56-6df9-479c-b4b6-30d2c18ce837', category: 'GOVERNMENT', name: 'Defence' },
  { id: '9869eb32-9c93-4ef4-b918-45110dc05baa', category: 'GOVERNMENT', name: 'Railway' },
  { id: '675eb54a-9565-46a8-ada6-86c2d2beb8eb', category: 'GOVERNMENT', name: 'Banking' },
  { id: '73eb9bc7-7636-46cf-897a-6d578393e475', category: 'MANAGEMENT', name: 'Management' },
  { id: 'd7b1c2b8-223f-40ec-937d-e6de565d8f14', category: 'MANAGEMENT', name: 'Finance' },
  { id: 'b2a5d359-da20-432d-b4ca-0ffa5c439dfb', category: 'MANAGEMENT', name: 'Marketing' }
];

export const DEFAULT_MASTER_CAREER_GOALS = [
  { id: 'd447ec43-1bd6-4abd-a754-de321cb47f9d', category: 'Government', name: 'Government Technical Job' },
  { id: 'e71e47bd-c0c3-4f1e-b7f9-af8be5401fc5', category: 'Government', name: 'IAS Officer' },
  { id: '2ac0716a-072c-4cdd-9e87-a96ad71dbf70', category: 'Government', name: 'Bank PO' },
  { id: 'bd891511-7cc5-4548-9654-a3a3019abab1', category: 'Private', name: 'Software Engineer' },
  { id: '2be8fb86-531e-4eb7-8834-93ba78192ec4', category: 'Private', name: 'AI/ML Engineer' },
  { id: 'b85f99f6-8d53-4a24-964d-8c8e5ed5ee88', category: 'Private', name: 'Cyber Security Expert' },
  { id: 'deed28fe-7f61-4403-981f-caad9da62a9e', category: 'Academic', name: 'Higher Studies' },
  { id: 'd63d9c7d-700f-4f1e-ac14-678ff9d66b2e', category: 'Academic', name: 'Research' }
];

export function getFallbackDegrees(levelId?: string) {
  if (!levelId) return DEFAULT_MASTER_DEGREES;
  return DEFAULT_MASTER_DEGREES.filter(d => d.education_level_id === levelId);
}

export function getFallbackStreams(levelId?: string) {
  if (!levelId) return DEFAULT_MASTER_STREAMS;
  return DEFAULT_MASTER_STREAMS.filter(s => s.education_level_id === levelId);
}

export function getFallbackBranches(degreeId?: string) {
  if (!degreeId) return DEFAULT_MASTER_BRANCHES;
  return DEFAULT_MASTER_BRANCHES.filter(b => b.degree_id === degreeId);
}

