export const PRESETS = {
  "reverse a string in javascript": {
    "problem": "Create a function in JavaScript to reverse a given string, handling potential edge cases.",
    "solution_1": `// Solution A: The Idiomatic Array-Chaining Approach
function reverseString(str) {
  if (typeof str !== 'string') return '';
  return str.split('').reverse().join('');
}`,
    "solution_2": `// Solution B: The Imperative Pointer Approach (No Allocations)
function reverseString(str) {
  if (typeof str !== 'string') return '';
  
  let reversed = '';
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}`,
    "judge": {
      "solution_1_score": 9.2,
      "solution_2_score": 7.4,
      "solution_1_reasoning": "This is the highly recommended approach in modern JavaScript. It is extremely readable, fits on a single line, and leverages the underlying JavaScript engine's optimized native array/string operations. For 99% of web applications, its performance is more than sufficient.",
      "solution_2_reasoning": "While this avoids temporary array allocations and shows a deep understanding of standard algorithms, it performs string concatenation in a loop, which can cause quadratic performance behavior in older engines. It is also more verbose and prone to off-by-one errors."
    }
  },
  "sql query to find second highest salary": {
    "problem": "Write an SQL query to find the second highest salary from an Employee table.",
    "solution_1": `-- Solution A: Using Subquery with MAX()
SELECT MAX(Salary) AS SecondHighestSalary
FROM Employee
WHERE Salary < (SELECT MAX(Salary) FROM Employee);`,
    "solution_2": `-- Solution B: Using LIMIT and OFFSET (DBMS-Specific)
SELECT Salary AS SecondHighestSalary
FROM Employee
ORDER BY Salary DESC
LIMIT 1 OFFSET 1;`,
    "judge": {
      "solution_1_score": 8.8,
      "solution_2_score": 7.5,
      "solution_1_reasoning": "Highly portable and works across almost all SQL database dialects (PostgreSQL, MySQL, SQLite, Oracle, SQL Server). It handles duplicates perfectly because if the highest salary is shared, it correctly returns the next distinct salary below it.",
      "solution_2_reasoning": "Very concise and readable, but highly dialect-dependent (LIMIT/OFFSET is not standard SQL). More importantly, if there is a tie for the highest salary (e.g. multiple employees earning the maximum), this query will incorrectly return that same maximum salary as the second highest."
    }
  },
  "react fetch data on mount": {
    "problem": "Write a clean React component to fetch and render a list of products from a public API on component mount.",
    "solution_1": `// Solution A: Modern Custom Hook with AbortController
import { useState, useEffect } from 'react';

function useProducts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchData() {
      try {
        const res = await fetch('https://api.example.com/products', {
          signal: controller.signal
        });
        if (!res.ok) throw new Error('Failed to fetch products');
        const json = await res.json();
        setData(json);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, []);

  return { data, loading, error };
}`,
    "solution_2": `// Solution B: Basic Inline Fetch inside useEffect
import { useState, useEffect } from 'react';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.example.com/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}`,
    "judge": {
      "solution_1_score": 9.5,
      "solution_2_score": 6.0,
      "solution_1_reasoning": "Outstanding production-grade pattern. It abstracts the data fetching logic into a reusable hook, includes comprehensive error states, and utilizes an AbortController in the cleanup function to prevent memory leaks and race conditions if the component unmounts quickly.",
      "solution_2_reasoning": "A naive approach that will cause state updates on unmounted components (throwing React errors in console) and suffers from potential network race conditions. It also has no error handling whatsoever, causing the UI to freeze in a loading state if the request fails."
    }
  }
};

// Generates dynamic response based on user keywords if no preset matches
export function generateMockResponse(query) {
  const normalized = query.toLowerCase().trim();
  
  // Check presets
  for (const presetKey of Object.keys(PRESETS)) {
    if (normalized.includes(presetKey) || presetKey.includes(normalized)) {
      return PRESETS[presetKey];
    }
  }

  // Keywords detection
  let topic = "General Programming";
  let sol1Title = "Procedural & Iterative Solution";
  let sol2Title = "Functional or Library-Based Solution";
  let sol1 = `// Solution A: Quick Iterative/Custom Approach
function solveProblem(input) {
  // Process the request: "${query}"
  let result = null;
  // TODO: Add your custom processing logic here
  return result;
}`;
  let sol2 = `// Solution B: Using Native High-Level Abstractions
const solveProblem = (input) => {
  // Alternative design for: "${query}"
  return Array.isArray(input) 
    ? input.map(item => ({ ...item, processed: true }))
    : Object.assign({}, input);
};`;
  let score1 = 8.5;
  let score2 = 8.2;
  let reason1 = `Solution A provides an imperative, step-by-step resolution to the user's inquiry regarding "${query}". It is easy to debug, step through, and has highly predictable space complexity.`;
  let reason2 = `Solution B is a declarative, compact alternative. It relies on standard high-level language methods to implement "${query}". It is cleaner but allocates more heap objects.`;

  if (normalized.includes("python") || normalized.includes("py")) {
    topic = "Python Development";
    sol1Title = "Pythonic List Comprehension";
    sol2Title = "Standard Loop & Append Pattern";
    sol1 = `# Solution A: List Comprehension (Pythonic)
def solve_query(data):
    # Optimized execution for: "${query}"
    return [x for x in data if x is not None]`;
    sol2 = `# Solution B: Traditional For-Loop
def solve_query(data):
    # Basic implementation
    result = []
    for x in data:
        if x is not None:
            result.append(x)
    return result`;
    score1 = 9.4;
    score2 = 7.8;
    reason1 = "List comprehensions are highly optimized in CPython, running faster than explicit loops due to reduced bytecode instructions. This approach is highly readable and idiomatic Python.";
    reason2 = "The standard loop is clear for beginners but is slower and takes up more lines of code. However, it's easier to insert logging or break statements inside the block.";
  } else if (normalized.includes("css") || normalized.includes("flex") || normalized.includes("grid") || normalized.includes("layout")) {
    topic = "UI Styling & CSS Layouts";
    sol1Title = "CSS Grid Layout (Modern)";
    sol2Title = "CSS Flexbox Layout (Classic)";
    sol1 = `/* Solution A: CSS Grid (2-Dimensional) */
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  align-items: start;
}`;
    sol2 = `/* Solution B: CSS Flexbox with Wrap */
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.item {
  flex: 1 1 250px;
}`;
    score1 = 9.0;
    score2 = 8.0;
    reason1 = "CSS Grid is superior for multi-column grids where card sizing needs to be uniform both horizontally and vertically. It allows self-contained configuration without modifying child elements.";
    reason2 = "Flexbox is more compatible with older browsers and is great for simple wraps, but grid-alignment on the final row can stretch items awkwardly unless additional spacer nodes are added.";
  } else if (normalized.includes("api") || normalized.includes("fetch") || normalized.includes("axios")) {
    topic = "Network Requests & API integration";
    sol1Title = "Native fetch API with async/await";
    sol2Title = "Axios Library Wrapper";
    sol1 = `// Solution A: Modern Fetch API
async function getData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  return await response.json();
}`;
    sol2 = `// Solution B: Axios Fetch
import axios from 'axios';

async function getData(url) {
  const response = await axios.get(url);
  return response.data;
}`;
    score1 = 8.2;
    score2 = 8.8;
    reason1 = "Native fetch works out of the box in modern browsers and runtime environments (Node 18+), reducing client bundle size by avoiding external dependencies.";
    reason2 = "Axios is recommended here as it automatically transforms JSON, handles base URLs, supports response interceptors, and wraps network errors (like 4xx and 5xx) in rejected promises automatically.";
  } else if (normalized.includes("performance") || normalized.includes("optimize") || normalized.includes("fast")) {
    topic = "Performance Optimization";
    sol1Title = "Memoization (Caching)";
    sol2Title = "On-Demand Computation";
    sol1 = `// Solution A: Fibonacci with Memoization
const memo = new Map();
function fib(n) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n);
  
  const val = fib(n - 1) + fib(n - 2);
  memo.set(n, val);
  return val;
}`;
    sol2 = `// Solution B: Standard Recursive Fibonacci
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`;
    score1 = 9.8;
    score2 = 3.0;
    reason1 = "Memoization reduces time complexity from exponential O(2^n) to linear O(n), saving thousands of redundant operations for large inputs.";
    reason2 = "Naive recursion causes extreme CPU blockage for n > 40 due to repetitive tree traversal. It is highly discouraged for production systems.";
  }

  return {
    "problem": `Analyze the problem statement: "${query}" and formulate two potential architectural solutions.`,
    "solution_1": sol1,
    "solution_2": sol2,
    "judge": {
      "solution_1_score": score1,
      "solution_2_score": score2,
      "solution_1_reasoning": reason1,
      "solution_2_reasoning": reason2
    }
  };
}
