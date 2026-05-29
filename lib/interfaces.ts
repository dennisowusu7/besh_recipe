export interface Comment {
    id: number;
    comment: string;
    createdAt: string;
    user: {
        id: number;
        name: string;
        profileImage: string | null;
    };
    userId: number;
}

export interface CommentsSectionProps {
    recipeId: number;
    initialCount?: number;
}

export interface Rating {
    id: number;
    rating: number;
    userId: number;
    user: {
        id: number;
        name: string;
        profileImage: string | null;
    };
}

export interface RatingsSectionProps {
    recipeId: number;
    initialCount?: number;
}

export interface SaveRecipeButtonProps {
    recipeId: number;
    initialSaveCount?: number;
}

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    profileImage: string | null;
    createdAt: string;
    _count?: {
        recipes: number;
        savedRecipes: number;
        comments: number;
        ratings: number;
    };
}

export interface Recipe {
    id: number;
    title: string;
    imageUrl: string;
    difficulty: string;
    createdAt: string;
    _count?: {
        comments: number;
        ratings: number;
        savedRecipes: number;
    };
}

export interface DashboardStats {
    totalUsers: number;
    totalRecipes: number;
    totalComments: number;
    totalRatings: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    isActive?: boolean;
    createdAt: string;
    _count?: {
        recipes: number;
    };
}

export interface Ingredient {
    id: number;
    name: string;
}

export interface SelectedIngredient {
    id: number | null;
    name: string;
    quantity: string;
    isNew?: boolean;
}

export interface IngredientSelectorProps {
    ingredients: SelectedIngredient[];
    onIngredientsChange: (ingredients: SelectedIngredient[]) => void;
}

export interface NutritionData {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
}

export interface NutritionSectionProps {
    recipeTitle: string;
    servings?: number;
}