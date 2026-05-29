import { ConnectToDB, getErrorMessage, getSuccessMessage } from "@/lib/helpers";

interface NutritionData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
}

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const recipeTitle = searchParams.get("recipe");
        const servings = searchParams.get("servings") || "4";

        if (!recipeTitle) {
            return getErrorMessage("Validation Error", "Recipe title is required", 400, "Bad Request");
        }

        const apiKey = process.env.SPOONACULAR_API_KEY;
        if (!apiKey) {
            return getErrorMessage("Configuration Error", "Nutrition API key not configured", 500, "Internal Server Error");
        }

        // Search for recipe on Spoonacular
        const searchRes = await fetch(
            `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(recipeTitle)}&number=1&apiKey=${apiKey}`
        );

        if (!searchRes.ok) {
            return getErrorMessage("Error occurred", "Failed to search recipes", 500, "Internal Server Error");
        }

        const searchData = (await searchRes.json()) as { results: Array<{ id: number }> };
        if (!searchData.results || searchData.results.length === 0) {
            return getSuccessMessage("No nutrition data found", null, 200, "OK");
        }

        const recipeId = searchData.results[0].id;

        // Get nutrition information
        const nutritionRes = await fetch(
            `https://api.spoonacular.com/recipes/${recipeId}/nutritionWidget.json?defaultCss=false&apiKey=${apiKey}`
        );

        if (!nutritionRes.ok) {
            return getErrorMessage("Error occurred", "Failed to fetch nutrition data", 500, "Internal Server Error");
        }

        const nutritionData = (await nutritionRes.json()) as {
            nutrients: Array<{ title: string; value: string }>;
        };

        // Extract key nutrients
        const nutrients: Record<string, string> = {};
        nutritionData.nutrients.forEach((n) => {
            nutrients[n.title.toLowerCase()] = n.value;
        });

        // Calculate per serving values
        const servingCount = Number(servings) || 4;
        const nutrition: NutritionData = {
            calories: Math.round(Number(nutrients["calories"] || 0) / servingCount),
            protein: Math.round((Number(nutrients["protein"] || 0) / servingCount) * 10) / 10,
            carbs: Math.round((Number(nutrients["carbohydrates"] || 0) / servingCount) * 10) / 10,
            fat: Math.round((Number(nutrients["fat"] || 0) / servingCount) * 10) / 10,
            fiber: Math.round((Number(nutrients["fiber"] || 0) / servingCount) * 10) / 10,
            sugar: Math.round((Number(nutrients["sugar"] || 0) / servingCount) * 10) / 10,
        };

        return getSuccessMessage("Nutrition data retrieved successfully", nutrition, 200, "OK");
    } catch (err: unknown) {
        return getErrorMessage("Error occurred", err, 500, "Internal Server Error");
    }
};
