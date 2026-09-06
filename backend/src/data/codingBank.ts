import { CodingQuestion, DSATopic, CodingDifficulty } from '../models/codingTypes.js';

export const codingBank: CodingQuestion[] = [
  // 1. ARRAYS - Easy
  {
    id: 'dsa-q-1',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'easy',
    topic: 'Arrays',
    description:
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1, 2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      }
    ],
    starterCode: {
      python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};`,
      java: `import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}`
    },
    visibleTestCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0, 1]', explanation: '2 + 7 = 9' },
      { input: '[3,2,4]\n6', expectedOutput: '[1, 2]', explanation: '2 + 4 = 6' }
    ],
    hiddenTestCases: [
      { input: '[3,3]\n6', expectedOutput: '[0, 1]', isHidden: true },
      { input: '[1,5,8,12,19]\n20', expectedOutput: '[0, 4]', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(N)'
  },

  // 2. ARRAYS - Medium
  {
    id: 'dsa-q-2',
    title: 'Maximum Subarray (Kadane)',
    slug: 'maximum-subarray',
    difficulty: 'medium',
    topic: 'Arrays',
    description:
      'Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.\n\nA subarray is a contiguous part of an array.',
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'Subarray [4,-1,2,1] has the largest sum = 6.'
      },
      {
        input: 'nums = [1]',
        output: '1',
        explanation: 'The subarray [1] has the largest sum 1.'
      }
    ],
    starterCode: {
      python: `class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}`
    },
    visibleTestCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
      { input: '[1]', expectedOutput: '1' }
    ],
    hiddenTestCases: [
      { input: '[5,4,-1,7,8]', expectedOutput: '23', isHidden: true },
      { input: '[-1,-2,-3]', expectedOutput: '-1', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)'
  },

  // 3. ARRAYS - Hard
  {
    id: 'dsa-q-3',
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'hard',
    topic: 'Arrays',
    description:
      'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    examples: [
      {
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The elevation map traps 6 units of rain water.'
      }
    ],
    starterCode: {
      python: `class Solution:\n    def trap(self, height: list[int]) -> int:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int trap(int[] height) {\n        return 0;\n    }\n}`
    },
    visibleTestCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
      { input: '[4,2,0,3,2,5]', expectedOutput: '9' }
    ],
    hiddenTestCases: [
      { input: '[3,0,2,0,4]', expectedOutput: '7', isHidden: true },
      { input: '[1,2,3,4,5]', expectedOutput: '0', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)'
  },

  // 4. STRINGS - Easy
  {
    id: 'dsa-q-4',
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    difficulty: 'easy',
    topic: 'Strings',
    description:
      'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
    constraints: ['1 <= s.length <= 2 * 10^5', 's consists only of printable ASCII characters.'],
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.'
      },
      {
        input: 's = "race a car"',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.'
      }
    ],
    starterCode: {
      python: `class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        # Write your solution here\n        pass`,
      cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isPalindrome(string s) {\n        return true;\n    }\n};`,
      java: `class Solution {\n    public boolean isPalindrome(String s) {\n        return true;\n    }\n}`
    },
    visibleTestCases: [
      { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true' },
      { input: '"race a car"', expectedOutput: 'false' }
    ],
    hiddenTestCases: [
      { input: '" "', expectedOutput: 'true', isHidden: true },
      { input: '"0P"', expectedOutput: 'false', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)'
  },

  // 5. STRINGS - Medium
  {
    id: 'dsa-q-5',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating',
    difficulty: 'medium',
    topic: 'Strings',
    description:
      'Given a string `s`, find the length of the longest substring without repeating characters.',
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.'
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.'
      }
    ],
    starterCode: {
      python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Write your solution here\n        pass`,
      cpp: `#include <string>\n#include <unordered_set>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}`
    },
    visibleTestCases: [
      { input: '"abcabcbb"', expectedOutput: '3' },
      { input: '"bbbbb"', expectedOutput: '1' }
    ],
    hiddenTestCases: [
      { input: '"pwwkew"', expectedOutput: '3', isHidden: true },
      { input: '""', expectedOutput: '0', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(min(M, N))'
  },

  // 6. LINKED LISTS - Easy
  {
    id: 'dsa-q-6',
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    difficulty: 'easy',
    topic: 'Linked Lists',
    description:
      'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    constraints: ['The number of nodes in the list is in the range [0, 5000].', '-5000 <= Node.val <= 5000'],
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]'
      }
    ],
    starterCode: {
      python: `# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def reverseList(self, head: list[int]) -> list[int]:\n        # Write your solution here\n        pass`,
      cpp: `struct ListNode { int val; ListNode *next; };\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        return nullptr;\n    }\n};`,
      java: `class ListNode { int val; ListNode next; }\nclass Solution {\n    public ListNode reverseList(ListNode head) {\n        return null;\n    }\n}`
    },
    visibleTestCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' },
      { input: '[1,2]', expectedOutput: '[2,1]' }
    ],
    hiddenTestCases: [
      { input: '[]', expectedOutput: '[]', isHidden: true },
      { input: '[10]', expectedOutput: '[10]', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)'
  },

  // 7. STACKS & QUEUES - Easy
  {
    id: 'dsa-q-7',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'easy',
    topic: 'Stacks & Queues',
    description:
      'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only "()[]{}"'],
    examples: [
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    starterCode: {
      python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your solution here\n        pass`,
      cpp: `#include <string>\n#include <stack>\nusing namespace std;\nclass Solution {\npublic:\n    bool isValid(string s) {\n        return true;\n    }\n};`,
      java: `import java.util.*;\nclass Solution {\n    public boolean isValid(String s) {\n        return true;\n    }\n}`
    },
    visibleTestCases: [
      { input: '"()[]{}"', expectedOutput: 'true' },
      { input: '"(]"', expectedOutput: 'false' }
    ],
    hiddenTestCases: [
      { input: '"([)]"', expectedOutput: 'false', isHidden: true },
      { input: '"{[]}"', expectedOutput: 'true', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(N)'
  },

  // 8. TREES - Easy
  {
    id: 'dsa-q-8',
    title: 'Invert Binary Tree',
    slug: 'invert-binary-tree',
    difficulty: 'easy',
    topic: 'Trees',
    description:
      'Given the root of a binary tree, invert the tree, and return its root.\n\nInverting a tree means swapping every left child with its right child.',
    constraints: ['The number of nodes in the tree is in the range [0, 100].', '-100 <= Node.val <= 100'],
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' }
    ],
    starterCode: {
      python: `class Solution:\n    def invertTree(self, root: list) -> list:\n        # Write your solution here\n        pass`,
      cpp: `struct TreeNode { int val; TreeNode *left; TreeNode *right; };\nclass Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        return nullptr;\n    }\n};`,
      java: `class TreeNode { int val; TreeNode left; TreeNode right; }\nclass Solution {\n    public TreeNode invertTree(TreeNode root) {\n        return null;\n    }\n}`
    },
    visibleTestCases: [
      { input: '[4,2,7,1,3,6,9]', expectedOutput: '[4,7,2,9,6,3,1]' },
      { input: '[2,1,3]', expectedOutput: '[2,3,1]' }
    ],
    hiddenTestCases: [
      { input: '[]', expectedOutput: '[]', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(H)'
  },

  // 9. DYNAMIC PROGRAMMING - Easy
  {
    id: 'dsa-q-9',
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'easy',
    topic: 'Dynamic Programming',
    description:
      'You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    constraints: ['1 <= n <= 45'],
    examples: [
      { input: 'n = 2', output: '2', explanation: '1 step + 1 step, or 2 steps.' },
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' }
    ],
    starterCode: {
      python: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        # Write your solution here\n        pass`,
      cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}`
    },
    visibleTestCases: [
      { input: '2', expectedOutput: '2' },
      { input: '3', expectedOutput: '3' }
    ],
    hiddenTestCases: [
      { input: '5', expectedOutput: '8', isHidden: true },
      { input: '10', expectedOutput: '89', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)'
  },

  // 10. DYNAMIC PROGRAMMING - Medium
  {
    id: 'dsa-q-10',
    title: 'Coin Change',
    slug: 'coin-change',
    difficulty: 'medium',
    topic: 'Dynamic Programming',
    description:
      'Given an integer array `coins` representing coins of different denominations and an integer `amount`, return the fewest number of coins that you need to make up that amount.\n\nIf that amount of money cannot be made up by any combination of the coins, return `-1`.',
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' }
    ],
    starterCode: {
      python: `class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int coinChange(int[] coins, int amount) {\n        return 0;\n    }\n}`
    },
    visibleTestCases: [
      { input: '[1,2,5]\n11', expectedOutput: '3' },
      { input: '[2]\n3', expectedOutput: '-1' }
    ],
    hiddenTestCases: [
      { input: '[1]\n0', expectedOutput: '0', isHidden: true },
      { input: '[186,419,83,408]\n6249', expectedOutput: '20', isHidden: true }
    ],
    expectedTimeComplexity: 'O(amount * N)',
    expectedSpaceComplexity: 'O(amount)'
  },

  // 11. BINARY SEARCH - Medium
  {
    id: 'dsa-q-11',
    title: 'Search in Rotated Sorted Array',
    slug: 'search-rotated-sorted-array',
    difficulty: 'medium',
    topic: 'Binary Search',
    description:
      'Given the array `nums` after a possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.',
    constraints: ['1 <= nums.length <= 5000', '-10^4 <= nums[i] <= 10^4', 'All values of nums are unique.'],
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1' }
    ],
    starterCode: {
      python: `class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}`
    },
    visibleTestCases: [
      { input: '[4,5,6,7,0,1,2]\n0', expectedOutput: '4' },
      { input: '[4,5,6,7,0,1,2]\n3', expectedOutput: '-1' }
    ],
    hiddenTestCases: [
      { input: '[1]\n0', expectedOutput: '-1', isHidden: true }
    ],
    expectedTimeComplexity: 'O(log N)',
    expectedSpaceComplexity: 'O(1)'
  },

  // 12. GRAPHS - Medium
  {
    id: 'dsa-q-12',
    title: 'Number of Islands',
    slug: 'number-of-islands',
    difficulty: 'medium',
    topic: 'Graphs',
    description:
      'Given an `m x n` 2D binary grid `grid` which represents a map of `"1"`s (land) and `"0"`s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300'],
    examples: [
      {
        input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]',
        output: '2'
      }
    ],
    starterCode: {
      python: `class Solution:\n    def numIslands(self, grid: list[list[str]]) -> int:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        return 0;\n    }\n}`
    },
    visibleTestCases: [
      { input: '[["1","1","0"],["1","1","0"],["0","0","1"]]', expectedOutput: '2' }
    ],
    hiddenTestCases: [
      { input: '[["1","1","1"],["0","1","0"],["1","1","1"]]', expectedOutput: '1', isHidden: true }
    ],
    expectedTimeComplexity: 'O(M * N)',
    expectedSpaceComplexity: 'O(M * N)'
  },

  // 13. TWO POINTERS - Medium
  {
    id: 'dsa-q-13',
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'medium',
    topic: 'Two Pointers',
    description:
      'Given `n` non-negative integers `height` where each represents a point at coordinate `(i, height[i])`. Find two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.',
    constraints: ['n == height.length', '2 <= n <= 10^5', '0 <= height[i] <= 10^4'],
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'The max area is between index 1 and 8: 7 * min(8, 7) = 49.' }
    ],
    starterCode: {
      python: `class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int maxArea(int[] height) {\n        return 0;\n    }\n}`
    },
    visibleTestCases: [
      { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49' },
      { input: '[1,1]', expectedOutput: '1' }
    ],
    hiddenTestCases: [
      { input: '[4,3,2,1,4]', expectedOutput: '16', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)'
  },

  // 14. SLIDING WINDOW - Medium
  {
    id: 'dsa-q-14',
    title: 'Minimum Size Subarray Sum',
    slug: 'minimum-size-subarray-sum',
    difficulty: 'medium',
    topic: 'Sliding Window',
    description:
      'Given an array of positive integers `nums` and a positive integer `target`, return the minimal length of a contiguous subarray of which the sum is greater than or equal to `target`. If there is no such subarray, return 0 instead.',
    constraints: ['1 <= target <= 10^9', '1 <= nums.length <= 10^5', '1 <= nums[i] <= 10^4'],
    examples: [
      { input: 'target = 7, nums = [2,3,1,2,4,3]', output: '2', explanation: 'The subarray [4,3] has minimal length 2.' }
    ],
    starterCode: {
      python: `class Solution:\n    def minSubArrayLen(self, target: int, nums: list[int]) -> int:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int minSubArrayLen(int target, vector<int>& nums) {\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int minSubArrayLen(int target, int[] nums) {\n        return 0;\n    }\n}`
    },
    visibleTestCases: [
      { input: '7\n[2,3,1,2,4,3]', expectedOutput: '2' },
      { input: '4\n[1,4,4]', expectedOutput: '1' }
    ],
    hiddenTestCases: [
      { input: '11\n[1,1,1,1,1,1,1,1]', expectedOutput: '0', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)'
  },

  // 15. GREEDY - Medium
  {
    id: 'dsa-q-15',
    title: 'Jump Game',
    slug: 'jump-game',
    difficulty: 'medium',
    topic: 'Greedy',
    description:
      'You are given an integer array `nums`. You are initially positioned at the array\'s first index, and each element in the array represents your maximum jump length at that position.\n\nReturn `true` if you can reach the last index, or `false` otherwise.',
    constraints: ['1 <= nums.length <= 10^4', '0 <= nums[i] <= 10^5'],
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: 'true' },
      { input: 'nums = [3,2,1,0,4]', output: 'false' }
    ],
    starterCode: {
      python: `class Solution:\n    def canJump(self, nums: list[int]) -> bool:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    bool canJump(vector<int>& nums) {\n        return true;\n    }\n};`,
      java: `class Solution {\n    public boolean canJump(int[] nums) {\n        return true;\n    }\n}`
    },
    visibleTestCases: [
      { input: '[2,3,1,1,4]', expectedOutput: 'true' },
      { input: '[3,2,1,0,4]', expectedOutput: 'false' }
    ],
    hiddenTestCases: [
      { input: '[0]', expectedOutput: 'true', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)'
  },

  // 16. MATRIX - Medium
  {
    id: 'dsa-q-16',
    title: 'Set Matrix Zeroes',
    slug: 'set-matrix-zeroes',
    difficulty: 'medium',
    topic: 'Matrix',
    description:
      'Given an `m x n` integer matrix `matrix`, if an element is 0, set its entire row and column to 0s.\n\nYou must do it in-place.',
    constraints: ['m == matrix.length', 'n == matrix[0].length', '1 <= m, n <= 200'],
    examples: [
      { input: 'matrix = [[1,1,1],[1,0,1],[1,1,1]]', output: '[[1,0,1],[0,0,0],[1,0,1]]' }
    ],
    starterCode: {
      python: `class Solution:\n    def setZeroes(self, matrix: list[list[int]]) -> list[list[int]]:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    void setZeroes(vector<vector<int>>& matrix) {\n    }\n};`,
      java: `class Solution {\n    public void setZeroes(int[][] matrix) {\n    }\n}`
    },
    visibleTestCases: [
      { input: '[[1,1,1],[1,0,1],[1,1,1]]', expectedOutput: '[[1,0,1],[0,0,0],[1,0,1]]' }
    ],
    hiddenTestCases: [
      { input: '[[0,1,2,0],[3,4,5,2],[1,3,1,5]]', expectedOutput: '[[0,0,0,0],[0,4,5,0],[0,3,1,0]]', isHidden: true }
    ],
    expectedTimeComplexity: 'O(M * N)',
    expectedSpaceComplexity: 'O(1)'
  },

  // 17. BIT MANIPULATION - Easy
  {
    id: 'dsa-q-17',
    title: 'Single Number',
    slug: 'single-number',
    difficulty: 'easy',
    topic: 'Bit Manipulation',
    description:
      'Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.',
    constraints: ['1 <= nums.length <= 3 * 10^4', '-3 * 10^4 <= nums[i] <= 3 * 10^4'],
    examples: [
      { input: 'nums = [2,2,1]', output: '1' },
      { input: 'nums = [4,1,2,1,2]', output: '4' }
    ],
    starterCode: {
      python: `class Solution:\n    def singleNumber(self, nums: list[int]) -> int:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int singleNumber(int[] nums) {\n        return 0;\n    }\n}`
    },
    visibleTestCases: [
      { input: '[2,2,1]', expectedOutput: '1' },
      { input: '[4,1,2,1,2]', expectedOutput: '4' }
    ],
    hiddenTestCases: [
      { input: '[1]', expectedOutput: '1', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N)',
    expectedSpaceComplexity: 'O(1)'
  },

  // 18. RECURSION - Medium
  {
    id: 'dsa-q-18',
    title: 'Subsets',
    slug: 'subsets',
    difficulty: 'medium',
    topic: 'Recursion',
    description:
      'Given an integer array `nums` of unique elements, return all possible subsets (the power set).\n\nThe solution set must not contain duplicate subsets. Return the solution in any order.',
    constraints: ['1 <= nums.length <= 10', '-10 <= nums[i] <= 10', 'All numbers of nums are unique.'],
    examples: [
      { input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' }
    ],
    starterCode: {
      python: `class Solution:\n    def subsets(self, nums: list[int]) -> list[list[int]]:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    vector<vector<int>> subsets(vector<int>& nums) {\n        return {};\n    }\n};`,
      java: `import java.util.*;\nclass Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        return new ArrayList<>();\n    }\n}`
    },
    visibleTestCases: [
      { input: '[1,2]', expectedOutput: '[[],[1],[2],[1,2]]' }
    ],
    hiddenTestCases: [
      { input: '[0]', expectedOutput: '[[],[0]]', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N * 2^N)',
    expectedSpaceComplexity: 'O(N)'
  },

  // 19. SORTING & SEARCHING - Medium
  {
    id: 'dsa-q-19',
    title: 'Kth Largest Element in an Array',
    slug: 'kth-largest-element',
    difficulty: 'medium',
    topic: 'Sorting & Searching',
    description:
      'Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array.\n\nNote that it is the `k`th largest element in sorted order, not the `k`th distinct element.',
    constraints: ['1 <= k <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' },
      { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4' }
    ],
    starterCode: {
      python: `class Solution:\n    def findKthLargest(self, nums: list[int], k: int) -> int:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\n#include <queue>\nusing namespace std;\nclass Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        return 0;\n    }\n};`,
      java: `import java.util.*;\nclass Solution {\n    public int findKthLargest(int[] nums, int k) {\n        return 0;\n    }\n}`
    },
    visibleTestCases: [
      { input: '[3,2,1,5,6,4]\n2', expectedOutput: '5' },
      { input: '[3,2,3,1,2,4,5,5,6]\n4', expectedOutput: '4' }
    ],
    hiddenTestCases: [
      { input: '[1]\n1', expectedOutput: '1', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N log K)',
    expectedSpaceComplexity: 'O(K)'
  },

  // 20. STRINGS - Medium
  {
    id: 'dsa-q-20',
    title: 'Group Anagrams',
    slug: 'group-anagrams',
    difficulty: 'medium',
    topic: 'Strings',
    description:
      'Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.',
    constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100', 'strs[i] consists of lowercase English letters.'],
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }
    ],
    starterCode: {
      python: `class Solution:\n    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:\n        # Write your solution here\n        pass`,
      cpp: `#include <vector>\n#include <string>\n#include <unordered_map>\nusing namespace std;\nclass Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        return {};\n    }\n};`,
      java: `import java.util.*;\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        return new ArrayList<>();\n    }\n}`
    },
    visibleTestCases: [
      { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }
    ],
    hiddenTestCases: [
      { input: '[""]', expectedOutput: '[[""]]', isHidden: true }
    ],
    expectedTimeComplexity: 'O(N * K log K)',
    expectedSpaceComplexity: 'O(N * K)'
  }
];
