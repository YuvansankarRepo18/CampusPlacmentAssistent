import java.util.*;
import java.util.stream.*;
import java.io.*;

class Solution {
    public int trap(int[] height) {
        int l = 0, r = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (l < r) {
            if (height[l] < height[r]) {
                if (height[l] >= leftMax) leftMax = height[l];
                else water += leftMax - height[l];
                l++;
            } else {
                if (height[r] >= rightMax) rightMax = height[r];
                else water += rightMax - height[r];
                r--;
            }
        }
        return water;
    }
}

public class Main {
    public static void main(String[] args) {
        try {
            Solution sol = new Solution();
            java.lang.reflect.Method targetMethod = null;
            for (java.lang.reflect.Method m : Solution.class.getDeclaredMethods()) {
                if (!m.getName().contains("$") && !m.getName().equals("main")) {
                    targetMethod = m;
                    break;
                }
            }
            if (targetMethod == null) {
                System.out.println("COMPILATION_ERROR: No method found in Solution class");
                return;
            }

            targetMethod.setAccessible(true);
            Class<?>[] paramTypes = targetMethod.getParameterTypes();
            String rawInput = "[0,1,0,2,1,0,1,3,2,1,2,1]";
            String[] lines = rawInput.trim().split("\\n");

            Object[] parsedArgs = new Object[paramTypes.length];
            for (int i = 0; i < paramTypes.length && i < lines.length; i++) {
                parsedArgs[i] = parseJavaArg(lines[i].trim(), paramTypes[i]);
            }

            Object result = targetMethod.invoke(sol, parsedArgs);
            System.out.println(serializeJavaOutput(result));
        } catch (java.lang.reflect.InvocationTargetException e) {
            System.out.println("RUNTIME_ERROR: " + (e.getCause() != null ? e.getCause().toString() : e.toString()));
        } catch (Exception e) {
            System.out.println("RUNTIME_ERROR: " + e.getMessage());
        }
    }

    private static Object parseJavaArg(String line, Class<?> type) {
        if (type == int[].class || type.isArray() || type.getName().contains("[I")) {
            String clean = line.replace("[", "").replace("]", "").replace(" ", "").trim();
            if (clean.isEmpty()) return new int[0];
            String[] parts = clean.split(",");
            int[] arr = new int[parts.length];
            for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i].trim());
            return arr;
        } else if (type == int.class || type == Integer.class) {
            return Integer.parseInt(line.trim());
        } else if (type == String.class) {
            return line.replaceAll("^\"|\"$", "");
        } else if (type == boolean.class || type == Boolean.class) {
            return Boolean.parseBoolean(line.trim());
        } else if (type == char[][].class || type == String[][].class || type.getName().contains("[[C")) {
            String clean = line.trim();
            if (clean.startsWith("[") && clean.endsWith("]")) {
                clean = clean.substring(1, clean.length() - 1);
            }
            String[] rows = clean.split("\\],\\s*\\[");
            char[][] grid = new char[rows.length][];
            for (int i = 0; i < rows.length; i++) {
                String r = rows[i].replace("[", "").replace("]", "").replace(""", "");
                String[] cols = r.split(",");
                grid[i] = new char[cols.length];
                for (int j = 0; j < cols.length; j++) {
                    String val = cols[j].trim();
                    grid[i][j] = val.isEmpty() ? '0' : val.charAt(0);
                }
            }
            return grid;
        }
        return line;
    }

    private static String serializeJavaOutput(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof int[]) {
            return Arrays.toString((int[]) obj);
        }
        if (obj instanceof Object[]) {
            return Arrays.deepToString((Object[]) obj);
        }
        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                Object item = list.get(i);
                if (item instanceof List) {
                    sb.append(serializeJavaOutput(item));
                } else {
                    sb.append(item != null ? item.toString() : "null");
                }
                if (i < list.size() - 1) sb.append(",");
            }
            sb.append("]");
            return sb.toString();
        }
        return obj.toString();
    }
}
