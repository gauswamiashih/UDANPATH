export interface PYQQuestion {
  id: string;
  exam: string;
  examSlug: 'gate' | 'upsc-cse' | 'ssc-cgl' | 'jee-main';
  year: number;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  marks: number;
  negativeMarks: number;
  hint: string;
  solution: string;
  officialPaperUrl?: string;
}

export const PYQ_DATABASE: PYQQuestion[] = [
  // ==========================================
  // GATE CS 2024
  // ==========================================
  {
    id: 'pyq-gate-2024-algo-1',
    exam: 'GATE Computer Science & IT',
    examSlug: 'gate',
    year: 2024,
    subject: 'Algorithms',
    topic: 'Dynamic Programming & Recurrences',
    difficulty: 'Medium',
    question: 'Consider the recurrence relation for finding the Longest Common Subsequence (LCS) of two strings of lengths M and N. What is the space-optimized auxiliary space complexity required if only the length of the LCS is needed rather than the sequence itself?',
    options: [
      'O(min(M, N))',
      'O(M * N)',
      'O(M + N)',
      'O(log(M + N))'
    ],
    correctAnswer: 0,
    marks: 2,
    negativeMarks: 0.66,
    hint: 'Notice that computing entry L[i][j] in the LCS table only relies on values from the current row (i) and the immediately preceding row (i-1).',
    solution: 'To compute the length of LCS, standard 2D dynamic programming requires O(M * N) space for table dp[M+1][N+1]. However, since each row only depends on the previous row dp[i-1], we only need two rows of size min(M, N) at any given time. Hence, auxiliary space reduces to O(min(M, N)).',
    officialPaperUrl: 'https://gate2024.iisc.ac.in/archive/question-papers/'
  },
  {
    id: 'pyq-gate-2024-os-1',
    exam: 'GATE Computer Science & IT',
    examSlug: 'gate',
    year: 2024,
    subject: 'Operating Systems',
    topic: 'Virtual Memory & Page Replacement',
    difficulty: 'Medium',
    question: 'Consider a reference string of page accesses: 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5. Under which page replacement algorithm does Belady\'s Anomaly typically manifest when increasing the number of page frames allocated to a process from 3 to 4?',
    options: [
      'FIFO (First-In, First-Out)',
      'LRU (Least Recently Used)',
      'Optimal Page Replacement (OPT)',
      'LFU (Least Frequently Used)'
    ],
    correctAnswer: 0,
    marks: 1,
    negativeMarks: 0.33,
    hint: 'Stack-based algorithms (where the set of pages in memory for n frames is always a subset of pages for n+1 frames) never suffer from this anomaly.',
    solution: 'Belady\'s Anomaly occurs when allocating more page frames leads to more page faults. FIFO is not a stack algorithm; for the given reference string, 3 frames produce 9 page faults, while 4 frames produce 10 page faults. Algorithms like LRU and Optimal are stack algorithms and are immune to Belady\'s anomaly.',
    officialPaperUrl: 'https://gate2024.iisc.ac.in/archive/question-papers/'
  },
  {
    id: 'pyq-gate-2024-cn-1',
    exam: 'GATE Computer Science & IT',
    examSlug: 'gate',
    year: 2024,
    subject: 'Computer Networks',
    topic: 'IP Addressing & Subnetting',
    difficulty: 'Easy',
    question: 'An organization is granted the IPv4 address block 200.10.20.0/24. The administrator wishes to divide this network into 8 subnets with equal number of usable host addresses each. What is the subnet mask and how many usable hosts are available per subnet?',
    options: [
      'Subnet Mask: 255.255.255.224, Usable hosts: 30',
      'Subnet Mask: 255.255.255.240, Usable hosts: 14',
      'Subnet Mask: 255.255.255.192, Usable hosts: 62',
      'Subnet Mask: 255.255.255.224, Usable hosts: 32'
    ],
    correctAnswer: 0,
    marks: 2,
    negativeMarks: 0.66,
    hint: 'To create 8 subnets, you need 2^3 = 8, meaning 3 bits borrowed from the host portion. Each subnet has 2^(8-3) total addresses, minus network and broadcast.',
    solution: 'To create 8 subnets, we need log2(8) = 3 bits borrowed from the 8 host bits of a /24 network. The new prefix is /27. Mask: 11111111.11111111.11111111.11100000 = 255.255.255.224. Total IP addresses per subnet = 2^5 = 32. Subtracting network ID and direct broadcast ID yields 32 - 2 = 30 usable host IP addresses.',
    officialPaperUrl: 'https://gate2024.iisc.ac.in/archive/question-papers/'
  },
  {
    id: 'pyq-gate-2024-dbms-1',
    exam: 'GATE Computer Science & IT',
    examSlug: 'gate',
    year: 2024,
    subject: 'DBMS',
    topic: 'Relational Normalization & Functional Dependencies',
    difficulty: 'Hard',
    question: 'Given relation schema R(A, B, C, D, E) with Functional Dependencies F = { A -> BC, CD -> E, B -> D, E -> A }. What is the highest normal form satisfied by relation R?',
    options: [
      '3NF (Third Normal Form)',
      'BCNF (Boyce-Codd Normal Form)',
      '2NF (Second Normal Form)',
      '1NF only'
    ],
    correctAnswer: 0,
    marks: 2,
    negativeMarks: 0.66,
    hint: 'First compute candidate keys by taking attribute closures (A+, B+, E+...). Then check whether the determinant in every non-trivial FD is a superkey (BCNF) or if the RHS is a prime attribute (3NF).',
    solution: '1. Candidate Keys: A+ = {A,B,C,D,E}, B+ = {B,D}, E+ = {E,A,B,C,D}, (CD)+ = {C,D,E,A,B}, (BC)+ = {B,C,D,E,A}. The candidate keys are A, E, BC, and CD. All attributes {A, B, C, D, E} are prime attributes!\n2. Check B -> D: B is not a superkey, but D is a prime attribute (part of candidate key CD). Thus B -> D violates BCNF, but satisfies 3NF condition (RHS is prime). Therefore, the highest normal form is 3NF.',
    officialPaperUrl: 'https://gate2024.iisc.ac.in/archive/question-papers/'
  },

  // ==========================================
  // GATE CS 2023
  // ==========================================
  {
    id: 'pyq-gate-2023-toc-1',
    exam: 'GATE Computer Science & IT',
    examSlug: 'gate',
    year: 2023,
    subject: 'Theory of Computation',
    topic: 'Finite Automata & Regular Languages',
    difficulty: 'Medium',
    question: 'What is the minimum number of states in a Minimal Deterministic Finite Automaton (DFA) that accepts the language L = { w in {0, 1}* | the binary string w represents a decimal number divisible by 5 }? (Assume empty string ε evaluates to 0).',
    options: [
      '5 states',
      '6 states',
      '4 states',
      '10 states'
    ],
    correctAnswer: 0,
    marks: 1,
    negativeMarks: 0.33,
    hint: 'Think of the remainder states modulo 5. When a new bit b arrives, the new value becomes (2 * current_val + b) mod 5.',
    solution: 'A binary number evaluated mod 5 has 5 distinct congruence classes: remainder 0, 1, 2, 3, and 4. The transition function δ(q_r, b) = q_{(2r + b) mod 5}. All 5 remainder states are reachable and pairwise distinguishable with distinguishing strings. Hence, exactly 5 states are required with q_0 as both start and final state.',
    officialPaperUrl: 'https://gate.iitk.ac.in/archive/'
  },
  {
    id: 'pyq-gate-2023-ds-1',
    exam: 'GATE Computer Science & IT',
    examSlug: 'gate',
    year: 2023,
    subject: 'Data Structures',
    topic: 'Heaps & Priority Queues',
    difficulty: 'Easy',
    question: 'Suppose an array representation of a Min-Heap contains 10 distinct elements. At which index (1-based array indexing from 1 to 10) can the second smallest element reside?',
    options: [
      'Index 2 or 3 only',
      'Index 2 only',
      'Index 4, 5, 6 or 7',
      'Any index between 2 and 10'
    ],
    correctAnswer: 0,
    marks: 1,
    negativeMarks: 0.33,
    hint: 'In a min-heap, the minimum element of any subtree is at its root. Where do the immediate children of the root reside?',
    solution: 'In a Min-Heap, the root (index 1) holds the smallest element. The second smallest element in the entire heap must be one of the immediate direct children of the root. In 1-based indexing, the left child of node 1 is at 2*1 = 2, and the right child is at 2*1 + 1 = 3. Therefore, the second smallest element can only be at index 2 or 3.',
    officialPaperUrl: 'https://gate.iitk.ac.in/archive/'
  },
  {
    id: 'pyq-gate-2023-compiler-1',
    exam: 'GATE Computer Science & IT',
    examSlug: 'gate',
    year: 2023,
    subject: 'Compiler Design',
    topic: 'Syntax Analysis & Parsing',
    difficulty: 'Hard',
    question: 'Which of the following statements is TRUE regarding LR parsing tables for unambiguous Context-Free Grammars?',
    options: [
      'Every SLR(1) grammar is an LALR(1) grammar, and every LALR(1) grammar is a CLR(1) grammar.',
      'CLR(1) parsing tables have the same number of states as LALR(1) parsing tables.',
      'LALR(1) parsing tables may contain reduce-reduce conflicts that were not present in CLR(1) tables.',
      'An ambiguous grammar can be parsed deterministically by an LR(1) parser.'
    ],
    correctAnswer: 2,
    marks: 2,
    negativeMarks: 0.66,
    hint: 'Remember that LALR(1) merges LR(1) states that have identical core sets of items. What conflict can merging introduce?',
    solution: 'When merging LR(1) states with identical cores to form LALR(1) states, shift-reduce conflicts are never introduced, but reduce-reduce conflicts may arise. Also: SLR(1) ⊂ LALR(1) ⊂ CLR(1), meaning every SLR(1) grammar is LALR(1) and every LALR(1) grammar is CLR(1). Notice option C specifically highlights the classic LALR state merging trade-off: reduce-reduce conflicts can be introduced.',
    officialPaperUrl: 'https://gate.iitk.ac.in/archive/'
  },

  // ==========================================
  // GATE CS 2022
  // ==========================================
  {
    id: 'pyq-gate-2022-algo-1',
    exam: 'GATE Computer Science & IT',
    examSlug: 'gate',
    year: 2022,
    subject: 'Algorithms',
    topic: 'Graph Algorithms & Minimum Spanning Tree',
    difficulty: 'Medium',
    question: 'Let G = (V, E) be an undirected connected graph with distinct positive edge weights. Let e_max be the edge with the strictly maximum weight among all edges in G. Which of the following is ALWAYS TRUE?',
    options: [
      'If e_max belongs to a simple cycle in G, then e_max CANNOT be part of ANY Minimum Spanning Tree of G.',
      'e_max can never be part of any Minimum Spanning Tree of G.',
      'e_max is always part of the Shortest Path Tree from the source node.',
      'If e_max is a bridge in G, then e_max is still excluded from the MST.'
    ],
    correctAnswer: 0,
    marks: 2,
    negativeMarks: 0.66,
    hint: 'Recall the Cycle Property of Minimum Spanning Trees: for any cycle in a graph, the strictly heaviest edge in that cycle cannot belong to any MST.',
    solution: 'By the Cycle Property of MSTs: in any cycle C in graph G, if edge e has weight strictly greater than all other edges in C, then e cannot belong to any MST. If e_max is part of a simple cycle, it is strictly heavier than all other edges in that cycle, so it is guaranteed to be excluded. (Note: if e_max is a bridge/cut-edge not in any cycle, it must be included in every spanning tree, which disproves option B).',
    officialPaperUrl: 'https://gate2022.iitkgp.ac.in/'
  },
  {
    id: 'pyq-gate-2022-os-1',
    exam: 'GATE Computer Science & IT',
    examSlug: 'gate',
    year: 2022,
    subject: 'Operating Systems',
    topic: 'Process Synchronization & Semaphores',
    difficulty: 'Medium',
    question: 'Three concurrent processes P1, P2, and P3 share two binary semaphores S1 and S2 initialized to 1 and 0 respectively. P1 executes wait(S1); print("A"); signal(S2). P2 executes wait(S2); print("B"); signal(S1). What is the periodic string printed?',
    options: [
      'ABABABAB...',
      'BABABABA...',
      'AABBAABB...',
      'Deadlock occurs immediately at start'
    ],
    correctAnswer: 0,
    marks: 1,
    negativeMarks: 0.33,
    hint: 'Trace the initial semaphore values: S1=1, S2=0. Which process is able to decrement its semaphore first without blocking?',
    solution: 'At start: S1=1, S2=0.\n1. P1 calls wait(S1): S1 becomes 0. P1 prints "A", then signals S2 (S2 becomes 1).\n2. P2 was blocked on wait(S2). Now S2=1, so P2 unblocks, decrements S2 to 0, prints "B", and signals S1 (S1 becomes 1).\n3. P1 can now run again. The sequence strictly alternates: ABABABAB...',
    officialPaperUrl: 'https://gate2022.iitkgp.ac.in/'
  },

  // ==========================================
  // UPSC PRELIMS GS-I 2024
  // ==========================================
  {
    id: 'pyq-upsc-2024-polity-1',
    exam: 'UPSC Civil Services (CSE)',
    examSlug: 'upsc-cse',
    year: 2024,
    subject: 'Indian Polity',
    topic: 'Constitutional Framework & Basic Structure',
    difficulty: 'Medium',
    question: 'With reference to the Constitution of India, consider the following statements:\n1. The phrase "Basic Structure" is explicitly defined under Article 368 of the Constitution.\n2. A Constitutional Amendment Bill under Article 368 requires prior recommendation of the President before introduction in Parliament.\n3. The President of India cannot withhold assent or return a Constitutional Amendment Bill passed duly by both Houses.\nWhich of the statements given above is/are correct?',
    options: [
      '3 only',
      '1 and 2 only',
      '2 and 3 only',
      '1, 2 and 3'
    ],
    correctAnswer: 0,
    marks: 2,
    negativeMarks: 0.66,
    hint: 'Examine statement 1: Did the makers of the Constitution write "Basic Structure" in 1950, or was it a judicial innovation in Kesavananda Bharati (1973)?',
    solution: 'Statement 1 is incorrect: "Basic Structure" is nowhere defined in the Constitution; it was formulated by the Supreme Court in the landmark Kesavananda Bharati case (1973).\nStatement 2 is incorrect: A Constitutional Amendment Bill does NOT require prior recommendation of the President (unlike Money Bills under Art 110).\nStatement 3 is correct: By the 24th Constitutional Amendment Act, 1971, it was made obligatory for the President to give assent to a Constitutional Amendment Bill. The President can neither withhold assent nor return it for reconsideration.',
    officialPaperUrl: 'https://upsc.gov.in/examinations/previous-question-papers'
  },
  {
    id: 'pyq-upsc-2024-economy-1',
    exam: 'UPSC Civil Services (CSE)',
    examSlug: 'upsc-cse',
    year: 2024,
    subject: 'Indian Economy',
    topic: 'Monetary Policy & Central Banking',
    difficulty: 'Medium',
    question: 'When the Reserve Bank of India (RBI) conducts an Open Market Operation (OMO) involving the outright purchase of Government Securities (G-Secs) from commercial banks, what is the immediate intended macroeconomic effect on the banking system?',
    options: [
      'Injection of liquidity into the banking system, lowering short-term interbank call money rates',
      'Absorption of excess liquidity from the market to counter inflationary expectations',
      'Direct increase in the Statutory Liquidity Ratio (SLR) requirement of schedule banks',
      'Appreciation of the Indian Rupee against the US Dollar through sterilized forex intervention'
    ],
    correctAnswer: 0,
    marks: 2,
    negativeMarks: 0.66,
    hint: 'RBI buys bonds from banks and pays money into banks\' cash reserves. What happens to the supply of money available to lend?',
    solution: 'When RBI purchases G-Secs from commercial banks in Open Market Operations, it transfers cash funds to the banks in exchange for the paper securities. This immediately injects fresh rupee liquidity into the commercial banking system, expanding bank credit capability and exerting downward pressure on short-term interbank interest rates.',
    officialPaperUrl: 'https://upsc.gov.in/examinations/previous-question-papers'
  },
  {
    id: 'pyq-upsc-2024-sci-1',
    exam: 'UPSC Civil Services (CSE)',
    examSlug: 'upsc-cse',
    year: 2024,
    subject: 'Science & Technology',
    topic: 'Quantum Computing & Qubits',
    difficulty: 'Easy',
    question: 'In the context of modern computing and communications technology, what fundamental property enables Quantum Computers to evaluate vast combinatorial possibilities exponentially faster than classical binary bits?',
    options: [
      'Superposition and Quantum Entanglement',
      'Optical Fiber Total Internal Reflection',
      'Thermal Superconductivity at ambient room temperatures',
      'Photovoltaic Electron Tunneling in silicon microchips'
    ],
    correctAnswer: 0,
    marks: 2,
    negativeMarks: 0.66,
    hint: 'Classical bits can exist only as 0 or 1. Quantum bits (qubits) can exist in linear combinations of both states simultaneously.',
    solution: 'Unlike classical digital computing bits which must resolve strictly to discrete states 0 or 1, quantum computing qubits utilize the quantum mechanical principles of Superposition (existing in a linear combination of |0> and |1> states simultaneously) and Quantum Entanglement (interdependent correlations between qubit states), granting exponential parallel computational capability (2^n states for n qubits).',
    officialPaperUrl: 'https://upsc.gov.in/examinations/previous-question-papers'
  },

  // ==========================================
  // UPSC PRELIMS GS-I 2023
  // ==========================================
  {
    id: 'pyq-upsc-2023-polity-1',
    exam: 'UPSC Civil Services (CSE)',
    examSlug: 'upsc-cse',
    year: 2023,
    subject: 'Indian Polity',
    topic: 'Fifth and Sixth Schedules',
    difficulty: 'Medium',
    question: 'Under the Sixth Schedule of the Indian Constitution, Autonomous District Councils (ADCs) have been constituted to administer tribal areas in which of the following groups of North-Eastern States?',
    options: [
      'Assam, Meghalaya, Tripura, and Mizoram',
      'Assam, Manipur, Nagaland, and Arunachal Pradesh',
      'Meghalaya, Tripura, Manipur, and Sikkim',
      'Arunachal Pradesh, Nagaland, Mizoram, and Tripura'
    ],
    correctAnswer: 0,
    marks: 2,
    negativeMarks: 0.66,
    hint: 'Remember the classic mnemonic "AMTM" (Assam, Meghalaya, Tripura, Mizoram) for Sixth Schedule tribal areas.',
    solution: 'Article 244(2) and the Sixth Schedule of the Constitution specifically provide special autonomous administrative provisions for the tribal areas in the four North-Eastern States: Assam, Meghalaya, Tripura, and Mizoram (AMTM). The other states (like Manipur and Nagaland) have separate constitutional mechanisms (such as Article 371A and 371C).',
    officialPaperUrl: 'https://upsc.gov.in/examinations/previous-question-papers'
  },
  {
    id: 'pyq-upsc-2023-history-1',
    exam: 'UPSC Civil Services (CSE)',
    examSlug: 'upsc-cse',
    year: 2023,
    subject: 'Modern History',
    topic: 'Government of India Act 1935',
    difficulty: 'Easy',
    question: 'The Government of India Act 1935 marked a significant turning point in the constitutional history of British India by introducing which of the following provisions?',
    options: [
      'Abolition of Dyarchy in the provinces and introduction of Provincial Autonomy',
      'Introduction of Dyarchy in the provinces for the first time',
      'Complete separation of Burma with immediate Dominion Status for India',
      'Establishment of an elected Constituent Assembly based on adult universal suffrage'
    ],
    correctAnswer: 0,
    marks: 2,
    negativeMarks: 0.66,
    hint: 'Dyarchy in the provinces had been introduced earlier by the Montagu-Chelmsford Reforms (GoI Act 1919). What did the 1935 Act do to provincial dyarchy?',
    solution: 'The Government of India Act 1935 abolished the controversial system of provincial dyarchy (transferred vs reserved subjects introduced by the 1919 Act) and replaced it with Provincial Autonomy. The Act simultaneously proposed Dyarchy at the Federal Centre (which never took effect due to princely states not joining the federation).',
    officialPaperUrl: 'https://upsc.gov.in/examinations/previous-question-papers'
  },

  // ==========================================
  // SSC CGL TIER-1 2024 & 2023
  // ==========================================
  {
    id: 'pyq-ssc-2024-quant-1',
    exam: 'SSC Combined Graduate Level (CGL)',
    examSlug: 'ssc-cgl',
    year: 2024,
    subject: 'Quantitative Aptitude',
    topic: 'Profit, Loss & Successive Discounts',
    difficulty: 'Medium',
    question: 'A shopkeeper marks an article at 40% above its cost price and allows two successive discounts of 15% and 10% on the marked price. If he makes a net profit of ₹142.80, find the original cost price (CP) of the article.',
    options: [
      '₹2,000',
      '₹1,800',
      '₹2,200',
      '₹2,400'
    ],
    correctAnswer: 0,
    marks: 2,
    negativeMarks: 0.50,
    hint: 'Let CP = 100x. Then MP = 140x. Single equivalent discount for 15% and 10% is 15 + 10 - (150/100) = 23.5%. Selling price is 76.5% of 140x.',
    solution: 'Let Cost Price (CP) = 100x.\nMarked Price (MP) = 140x.\nSuccessive discount: 15% and 10% -> Net selling multiplier = (1 - 0.15) * (1 - 0.10) = 0.85 * 0.90 = 0.765.\nSelling Price (SP) = 140x * 0.765 = 107.1x.\nProfit = SP - CP = 107.1x - 100x = 7.1x.\nGiven Profit = ₹142.80.\n7.1x = 142.80 => x = 142.80 / 7.1 = 20.\nTherefore, CP = 100 * 20 = ₹2,000.',
    officialPaperUrl: 'https://ssc.gov.in/'
  },
  {
    id: 'pyq-ssc-2024-reasoning-1',
    exam: 'SSC Combined Graduate Level (CGL)',
    examSlug: 'ssc-cgl',
    year: 2024,
    subject: 'General Intelligence & Reasoning',
    topic: 'Syllogism & Venn Logic',
    difficulty: 'Easy',
    question: 'Statements:\n1. All Engineers are Innovators.\n2. Some Innovators are Scientists.\nConclusions:\nI. Some Engineers are Scientists.\nII. Some Innovators are Engineers.\nWhich conclusion(s) logically follow(s)?',
    options: [
      'Only Conclusion II follows',
      'Only Conclusion I follows',
      'Both Conclusions I and II follow',
      'Neither Conclusion I nor II follows'
    ],
    correctAnswer: 0,
    marks: 2,
    negativeMarks: 0.50,
    hint: 'If set A is completely inside set B (All Engineers are Innovators), does that guarantee any intersection between A and set C (Scientists)?',
    solution: 'From Statement 1 ("All Engineers are Innovators"): The set of Engineers is a subset of Innovators. Therefore, the converse "Some Innovators are Engineers" MUST be true (Conclusion II follows).\nHowever, Statement 2 ("Some Innovators are Scientists") does not guarantee that the Scientists circle overlaps with the Engineers circle within Innovators. Thus Conclusion I is possible but not definite. Hence, ONLY Conclusion II logically follows.',
    officialPaperUrl: 'https://ssc.gov.in/'
  },
  {
    id: 'pyq-ssc-2023-english-1',
    exam: 'SSC Combined Graduate Level (CGL)',
    examSlug: 'ssc-cgl',
    year: 2023,
    subject: 'English Comprehension',
    topic: 'Spotting Errors & Subject-Verb Agreement',
    difficulty: 'Easy',
    question: 'Identify the segment in the sentence which contains a grammatical error:\n"The committee (A) / have decided to appoint (B) / a new spokesperson (C) / without any division among its members (D)."',
    options: [
      'Segment B ("have decided to appoint")',
      'Segment A ("The committee")',
      'Segment C ("a new spokesperson")',
      'No error'
    ],
    correctAnswer: 0,
    marks: 2,
    negativeMarks: 0.50,
    hint: 'Notice "its members" at the end of the sentence. The collective noun "committee" acts as a single unanimous unit.',
    solution: 'When a collective noun like "committee", "jury", or "board" acts unanimously as a single collective entity (as indicated by "without any division among its members"), it takes a SINGULAR verb ("has decided", not "have decided"). Therefore, Segment B contains the error and should be "has decided to appoint".',
    officialPaperUrl: 'https://ssc.gov.in/'
  }
];

export const AVAILABLE_YEARS = [2024, 2023, 2022, 2021];

export const EXAM_OPTIONS = [
  { label: 'All Exams', value: 'ALL' },
  { label: 'GATE CS & IT', value: 'gate' },
  { label: 'UPSC CSE (Prelims)', value: 'upsc-cse' },
  { label: 'SSC CGL (Tier-1)', value: 'ssc-cgl' }
];

