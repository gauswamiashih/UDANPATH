export interface MockQuestion {
  id: string;
  section: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number; // 0-based index
  marks: number;
  negativeMarks: number;
  explanation: string;
  topic: string;
}

export interface MockExam {
  id: string;
  title: string;
  shortName: string;
  category: string;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  sections: string[];
  description: string;
  questions: MockQuestion[];
}

export const MOCK_EXAMS_COLLECTION: MockExam[] = [
  {
    id: 'gate-cs-mock-1',
    title: 'GATE CS 2026: Core Technical & Aptitude Mock',
    shortName: 'GATE CS Mock',
    category: 'Engineering & Technology',
    durationMinutes: 15,
    totalMarks: 20,
    totalQuestions: 10,
    sections: ['General Aptitude', 'Computer Science & IT'],
    description: 'Realistic CBT simulation covering Data Structures, Algorithms, Operating Systems, DBMS, and Quantitative Reasoning.',
    questions: [
      {
        id: 'g-q1',
        section: 'General Aptitude',
        question: 'If "LOGIC" is coded as "OMJID" in a specific cipher, what will "ALGO" be coded as under the same rule?',
        options: ['CNIQ', 'BNHQ', 'BMHP', 'CNJP'],
        correctAnswer: 0,
        marks: 1,
        negativeMarks: 0.33,
        explanation: 'Each consonant and vowel shifts forward by (+3, +1, +3, +1) alternatively: A(+3)->D or letter pairing pattern. Here L(+3)=O, O(-2)=M... evaluating the cipher leads directly to CNIQ.',
        topic: 'Verbal & Logical Reasoning'
      },
      {
        id: 'g-q2',
        section: 'General Aptitude',
        question: 'A train 180 meters long running at 54 km/hr crosses a bridge in 20 seconds. What is the length of the bridge in meters?',
        options: ['120 m', '150 m', '200 m', '100 m'],
        correctAnswer: 0,
        marks: 1,
        negativeMarks: 0.33,
        explanation: 'Speed = 54 * (5/18) = 15 m/s. Total distance in 20 sec = 15 * 20 = 300 m. Bridge length = 300 - 180 = 120 meters.',
        topic: 'Quantitative Aptitude'
      },
      {
        id: 'g-q3',
        section: 'Computer Science & IT',
        question: 'What is the worst-case time complexity of searching for an element in a Red-Black Tree with N nodes?',
        options: ['O(log N)', 'O(N)', 'O(N log N)', 'O(1)'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'A Red-Black Tree guarantees that the maximum height is at most 2 * log2(N + 1). Therefore, worst-case search, insertion, and deletion are strictly O(log N).',
        topic: 'Data Structures'
      },
      {
        id: 'g-q4',
        section: 'Computer Science & IT',
        question: 'In an Operating System using Banker\'s Algorithm, which of the following states is guaranteed to be deadlock-free?',
        options: ['Safe state', 'Unsafe state', 'Starvation state', 'Preempted state'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'A safe state is defined as one where there exists at least one safe execution sequence that allows all processes to finish without entering a deadlock.',
        topic: 'Operating Systems'
      },
      {
        id: 'g-q5',
        section: 'Computer Science & IT',
        question: 'Consider a relational schema R(A, B, C, D) with functional dependencies {A -> B, B -> C, C -> D}. What is the highest normal form of R?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correctAnswer: 1,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'Candidate key is A. Non-prime attributes {B, C, D} have transitive dependencies (A -> B -> C -> D). Since transitive dependencies exist, it violates 3NF, but satisfies 2NF (no partial dependencies on a candidate key).',
        topic: 'DBMS'
      },
      {
        id: 'g-q6',
        section: 'Computer Science & IT',
        question: 'Which CPU scheduling algorithm is mathematically proven to achieve the minimum average waiting time for a given set of stationary processes?',
        options: ['Shortest Job First (SJF / SRTF)', 'First-Come First-Served (FCFS)', 'Round Robin with small quantum', 'Priority Scheduling'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'Shortest Job First (SJF) is optimal because moving a short process before a long process decreases the waiting time of the short process by more than it increases the waiting time of the long process.',
        topic: 'Operating Systems'
      },
      {
        id: 'g-q7',
        section: 'Computer Science & IT',
        question: 'What is the chromatic number of a bipartite graph with at least one edge?',
        options: ['2', '1', '3', 'Depends on vertices count'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'By definition, a bipartite graph\'s vertices can be partitioned into two independent sets such that no edge connects two vertices of the same set. Hence exactly 2 colors suffice.',
        topic: 'Discrete Mathematics'
      },
      {
        id: 'g-q8',
        section: 'Computer Science & IT',
        question: 'In TCP protocol, what mechanism handles flow control between sender and receiver?',
        options: ['Sliding Window Advertisement', 'Triple Duplicate ACKs', 'Slow Start Exponential growth', 'Checksum CRC-32'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'TCP uses the receive window (rwnd) field in the TCP header to advertise available buffer space, preventing sender from overwhelming the receiver.',
        topic: 'Computer Networks'
      },
      {
        id: 'g-q9',
        section: 'Computer Science & IT',
        question: 'What is the recurrence relation for the standard Merge Sort algorithm on an array of size N?',
        options: ['T(N) = 2T(N/2) + O(N)', 'T(N) = T(N-1) + O(N)', 'T(N) = 2T(N/2) + O(1)', 'T(N) = 4T(N/2) + O(N)'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'Merge sort divides the array into 2 halves (2 * T(N/2)) and then merges the two sorted halves in linear time O(N), yielding O(N log N).',
        topic: 'Algorithms'
      },
      {
        id: 'g-q10',
        section: 'Computer Science & IT',
        question: 'Which of the following problems is known to be undecidable?',
        options: ['The Halting Problem for Turing Machines', 'Determining whether a DFA accepts an empty language', 'Parsing an LL(1) grammar', 'Topological sort of a Directed Acyclic Graph'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'Alan Turing proved in 1936 that no general algorithm can decide whether an arbitrary computer program with an arbitrary input will finish running or run forever.',
        topic: 'Theory of Computation'
      }
    ]
  },
  {
    id: 'upsc-prelims-mock-1',
    title: 'UPSC CSE 2026: General Studies Paper-I Mock',
    shortName: 'UPSC GS Paper-I',
    category: 'Civil Services',
    durationMinutes: 15,
    totalMarks: 20,
    totalQuestions: 10,
    sections: ['Indian Polity', 'Economy & Environment', 'Modern History'],
    description: 'High-yield conceptual questions simulating the UPSC Civil Services Preliminary Examination format.',
    questions: [
      {
        id: 'u-q1',
        section: 'Indian Polity',
        question: 'Which Article of the Constitution of India provides for the establishment and constitution of the Supreme Court of India?',
        options: ['Article 124', 'Article 131', 'Article 143', 'Article 214'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'Article 124(1) of the Indian Constitution states that there shall be a Supreme Court of India consisting of a Chief Justice of India and other judges.',
        topic: 'Constitutional Framework'
      },
      {
        id: 'u-q2',
        section: 'Indian Polity',
        question: 'Consider the following statements regarding the "Writ of Habeas Corpus": It can be issued against both public authorities and private individuals. Is this statement correct?',
        options: ['Yes, it can be issued against both', 'No, only against public authorities', 'Only against high court judges', 'Only during Financial Emergency'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'Unlike Quo-Warranto or Mandamus, Habeas Corpus can be issued against both public officials and private entities holding an individual in unlawful detention.',
        topic: 'Fundamental Rights'
      },
      {
        id: 'u-q3',
        section: 'Economy & Environment',
        question: 'In the context of the Indian Economy, which of the following is considered an expansionary monetary policy by the Reserve Bank of India (RBI)?',
        options: ['Reducing the Repo Rate & Cash Reserve Ratio (CRR)', 'Increasing the Statutory Liquidity Ratio (SLR)', 'Selling Government Securities in open market', 'Raising the Marginal Standing Facility rate'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'Reducing repo rate and CRR lowers borrowing costs and injects liquidity into the banking system, stimulating economic expenditure.',
        topic: 'Macroeconomics & Monetary Policy'
      },
      {
        id: 'u-q4',
        section: 'Economy & Environment',
        question: 'The "Biological Diversity Act, 2002" was born out of India\'s commitments under which international agreement?',
        options: ['Convention on Biological Diversity (CBD) 1992', 'Ramsar Wetlands Convention 1971', 'Stockholm Conference on Persistent Organic Pollutants', 'CITES Convention 1973'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'India enacted the Biological Diversity Act, 2002 to realize the objectives of the UN Convention on Biological Diversity (CBD) agreed upon at Rio Earth Summit 1992.',
        topic: 'Environmental Treaties'
      },
      {
        id: 'u-q5',
        section: 'Modern History',
        question: 'Who among the following presided over the historic Lahore Session of the Indian National Congress in 1929 where "Purna Swaraj" was declared?',
        options: ['Jawaharlal Nehru', 'Subhash Chandra Bose', 'Mahatma Gandhi', 'Sardar Vallabhbhai Patel'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'Jawaharlal Nehru was the President of the 1929 Lahore Session where the resolution for Complete Independence (Purna Swaraj) was officially adopted.',
        topic: 'Freedom Struggle'
      },
      {
        id: 'u-q6',
        section: 'Indian Polity',
        question: 'Which Constitutional Amendment Act granted Constitutional Status and protection to Panchayati Raj Institutions in India?',
        options: ['73rd Constitutional Amendment Act, 1992', '74th Constitutional Amendment Act, 1992', '42nd Constitutional Amendment Act, 1976', '44th Constitutional Amendment Act, 1978'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'The 73rd Constitutional Amendment Act added Part IX to the Constitution entitled "The Panchayats" and the Eleventh Schedule containing 29 functional items.',
        topic: 'Local Self Governance'
      },
      {
        id: 'u-q7',
        section: 'Economy & Environment',
        question: 'The term "Gini Coefficient" is widely utilized by economists and institutions to measure what indicator?',
        options: ['Income Inequality in a population', 'Inflationary rate of commodities', 'Carbon emission per capita', 'Fiscal deficit percentage of GDP'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'The Gini Coefficient measures income or wealth distribution across a population, where 0 represents perfect equality and 1 represents maximal inequality.',
        topic: 'Economic Distribution'
      },
      {
        id: 'u-q8',
        section: 'Economy & Environment',
        question: 'Which of the following National Parks in India is famed for being the natural habitat of the endangered One-Horned Rhinoceros?',
        options: ['Kaziranga National Park', 'Jim Corbett National Park', 'Gir National Park', 'Bandipur National Park'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'Kaziranga National Park in Assam holds the world\'s largest population of the great Indian one-horned rhinoceros (Rhinoceros unicornis).',
        topic: 'Ecology & Biodiversity'
      },
      {
        id: 'u-q9',
        section: 'Modern History',
        question: 'The famous "Cabinet Mission" arrived in India in 1946 with which primary objective?',
        options: ['To discuss the transfer of power and frame a constitution-making body', 'To arrest prominent national leaders', 'To enforce the Government of India Act 1919', 'To divide states on linguistic lines'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'The Cabinet Mission (Pethick-Lawrence, Stafford Cripps, A.V. Alexander) aimed to negotiate the transfer of power and establish the Constituent Assembly.',
        topic: 'Modern History'
      },
      {
        id: 'u-q10',
        section: 'Indian Polity',
        question: 'Under the Indian Constitution, the President may declare a National Emergency under Article 352 on which of the following grounds?',
        options: ['War, External Aggression, or Armed Rebellion', 'Internal Disturbance only', 'Failure of Constitutional Machinery in State', 'Financial Instability'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.66,
        explanation: 'The 44th Amendment Act 1978 substituted the phrase "internal disturbance" with "armed rebellion". Hence Article 352 applies on War, External Aggression, or Armed Rebellion.',
        topic: 'Emergency Provisions'
      }
    ]
  },
  {
    id: 'ssc-cgl-mock-1',
    title: 'SSC CGL 2026: Tier-1 Full Quantitative & Reasoning Mock',
    shortName: 'SSC CGL Tier-1',
    category: 'Staff Selection / Central',
    durationMinutes: 15,
    totalMarks: 20,
    totalQuestions: 10,
    sections: ['Quantitative Aptitude', 'General Intelligence', 'English Comprehension'],
    description: 'Speed and accuracy practice mock reflecting recent TCS pattern for SSC CGL Tier 1.',
    questions: [
      {
        id: 's-q1',
        section: 'Quantitative Aptitude',
        question: 'A shopkeeper marks an article at ₹800 and gives a 15% discount. If he still makes a 20% profit, what is the cost price (CP) of the article?',
        options: ['₹566.67', '₹600.00', '₹540.00', '₹580.00'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.5,
        explanation: 'Selling Price (SP) = 800 * 0.85 = ₹680. Since Profit = 20%, SP = 1.20 * CP. CP = 680 / 1.20 = ₹566.67.',
        topic: 'Profit, Loss & Discount'
      },
      {
        id: 's-q2',
        section: 'Quantitative Aptitude',
        question: 'If x + (1/x) = 5, what is the value of x² + (1/x²)?',
        options: ['23', '25', '27', '21'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.5,
        explanation: '(x + 1/x)² = x² + 1/x² + 2. Hence, 5² - 2 = 25 - 2 = 23.',
        topic: 'Algebra'
      },
      {
        id: 's-q3',
        section: 'General Intelligence',
        question: 'Find the missing number in the series: 4, 9, 25, 49, 121, ?',
        options: ['169', '144', '196', '225'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.5,
        explanation: 'The numbers are squares of consecutive prime numbers: 2²=4, 3²=9, 5²=25, 7²=49, 11²=121. The next prime is 13, and 13² = 169.',
        topic: 'Number Series'
      },
      {
        id: 's-q4',
        section: 'General Intelligence',
        question: 'Pointing to a photograph, a woman says: "He is the only son of the father of my brother." How is the person in the photograph related to the woman?',
        options: ['Brother', 'Father', 'Uncle', 'Cousin'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.5,
        explanation: '"Father of my brother" is her father. "Only son of her father" must be her brother.',
        topic: 'Blood Relations'
      },
      {
        id: 's-q5',
        section: 'English Comprehension',
        question: 'Select the synonym for the word "METICULOUS":',
        options: ['Thorough & painstaking', 'Careless', 'Hasty', 'Vague'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.5,
        explanation: 'Meticulous means showing great attention to detail; very careful and precise.',
        topic: 'Vocabulary'
      },
      {
        id: 's-q6',
        section: 'Quantitative Aptitude',
        question: 'A can complete a piece of work in 12 days and B can do it in 18 days. If they work together, in how many days will the work be finished?',
        options: ['7.2 days', '6.5 days', '8.0 days', '7.5 days'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.5,
        explanation: 'Combined 1-day work = 1/12 + 1/18 = (3 + 2)/36 = 5/36. Total days = 36 / 5 = 7.2 days.',
        topic: 'Time and Work'
      },
      {
        id: 's-q7',
        section: 'Quantitative Aptitude',
        question: 'The value of sin²(30°) + cos²(60°) + tan²(45°) is equal to:',
        options: ['1.5', '1.0', '2.0', '0.5'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.5,
        explanation: 'sin(30°) = 1/2 -> 1/4; cos(60°) = 1/2 -> 1/4; tan(45°) = 1 -> 1. Total = 1/4 + 1/4 + 1 = 0.5 + 1 = 1.5.',
        topic: 'Trigonometry'
      },
      {
        id: 's-q8',
        section: 'General Intelligence',
        question: 'Arrange the words in a meaningful logical sequence: 1. Application  2. Examination  3. Advertisement  4. Selection  5. Interview',
        options: ['3, 1, 2, 5, 4', '1, 3, 2, 5, 4', '3, 2, 1, 5, 4', '2, 3, 1, 5, 4'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.5,
        explanation: 'Logical sequence: First Advertisement (3) -> Application (1) -> Examination (2) -> Interview (5) -> Selection (4).',
        topic: 'Logical Order'
      },
      {
        id: 's-q9',
        section: 'English Comprehension',
        question: 'Identify the error in the sentence: "Neither of the two candidates (A) / are eligible for (B) / the post of Assistant Director. (C) / No error (D)"',
        options: ['Part B ("are eligible")', 'Part A', 'Part C', 'Part D'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.5,
        explanation: '"Neither" is a singular pronoun and takes a singular verb: "is eligible for" instead of "are eligible for".',
        topic: 'Grammar'
      },
      {
        id: 's-q10',
        section: 'General Intelligence',
        question: 'In a class of 45 students, Rohan ranks 18th from the top. What is his rank from the bottom?',
        options: ['28th', '27th', '29th', '26th'],
        correctAnswer: 0,
        marks: 2,
        negativeMarks: 0.5,
        explanation: 'Total = Top + Bottom - 1. 45 = 18 + Bottom - 1 -> Bottom = 45 - 17 = 28th.',
        topic: 'Ranking & Order'
      }
    ]
  }
];

