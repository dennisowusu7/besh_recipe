export type RegisterBody = {
    name?: string;
    email?: string;
    password?: string;
    role?: "USER" | "ADMIN";
    profileImage?: string | null;
};


export type Category = {
    id: number;
    name: string;
    description?: string | null;
    createdAt: string;
    _count?: { recipes?: number };
};

export type RecipeFormValues = {
    title: string;
    description?: string;
    preparationSteps: string;
    cookingTime?: number;
    difficulty: "Easy" | "Medium" | "Hard";
    cuisine?: string;
    categoryId?: number;
    imageUrl?: string;
    image?: FileList;
    ingredients?: Array<{
        id: number | null;
        name: string;
        quantity: string;
        isNew?: boolean;
    }>;
};

export type PageLoadingProps = {
  message?: string;
};

export type HomeRecipe = {
    id: number;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    difficulty: "Easy" | "Medium" | "Hard";
    cuisine?: string | null;
    cookingTime?: number | null;
    user?: { name: string } | null;
    _count?: { comments?: number; ratings?: number; savedRecipes?: number } | null;
};

export type OwnerProps = {
    recipeId: number;
    ownerId: number;
};

export type RecipeDetails = {
    id: number;
    title: string;
    description?: string | null;
    preparationSteps: string;
    cookingTime?: number | null;
    difficulty: "Easy" | "Medium" | "Hard";
    cuisine?: string | null;
    imageUrl?: string | null;
    createdAt: string;
    user?: { id: number; name: string; profileImage?: string | null } | null;
    category?: { id: number; name: string } | null;
    ingredients?: Array<{
        id: number;
        quantity?: string | null;
        ingredient?: { id: number; name: string } | null;
    }>;
    _count?: { comments?: number; ratings?: number; savedRecipes?: number } | null;
};

export type RecipesPageProps = {
    params: Promise<{ id: string }>;
};

export type RegistrationFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type SigningFormData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type Ingredient = {
  id: number;
  name: string;
  createdAt: string;
  _count?: { recipes?: number };
};

export type IngredientDetails = {
  id: number;
  name: string;
  createdAt: string;
  recipes: Array<{
    id: number;
    recipeId: number;
    quantity?: string | null;
    recipe: {
      id: number;
      title: string;
      difficulty: 'Easy' | 'Medium' | 'Hard';
      imageUrl?: string | null;
    };
  }>;
  _count?: { recipes?: number };
};