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

// Welcome screen prompts (shown by App.jsx when a thread has no messages yet).
export const WELCOME_PRESETS = [
  { send: "reverse a string in javascript", label: "Reverse a string in JavaScript" },
  { send: "sql query to find second highest salary", label: "Second highest salary SQL query" },
  { send: "react fetch data on mount", label: "React data fetching on mount" },
];
