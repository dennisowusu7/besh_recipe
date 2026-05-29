"use client";

import { useState, useEffect, useRef } from "react";
import { FiPlus, FiTrash2, FiSearch } from "react-icons/fi";
import { Ingredient, IngredientSelectorProps, SelectedIngredient } from "@/lib/interfaces";



export default function IngredientSelector({ ingredients, onIngredientsChange }: IngredientSelectorProps) {
    const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
    const [loadingIngredients, setLoadingIngredients] = useState(false);
    const [showDropdown, setShowDropdown] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadIngredients = async () => {
            try {
                setLoadingIngredients(true);
                const res = await fetch("/api/ingredients", { cache: "no-store" });
                const payload = await res.json().catch(() => null);
                if (res.ok) {
                    setAllIngredients(Array.isArray(payload?.data) ? payload.data : []);
                }
            } catch {
                console.error("Failed to load ingredients");
            } finally {
                setLoadingIngredients(false);
            }
        };
        void loadIngredients();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAddIngredient = () => {
        const newIngredient: SelectedIngredient = {
            id: null,
            name: "",
            quantity: "",
            isNew: true,
        };
        onIngredientsChange([...ingredients, newIngredient]);
    };

    const handleRemoveIngredient = (index: number) => {
        onIngredientsChange(ingredients.filter((_, i) => i !== index));
    };

    const handleSelectIngredient = (ingredient: Ingredient, index: number) => {
        const updated = [...ingredients];
        updated[index] = {
            ...updated[index],
            id: ingredient.id,
            name: ingredient.name,
            isNew: false,
        };
        onIngredientsChange(updated);
        setShowDropdown(null);
        setSearchQuery("");
    };

    const handleQuantityChange = (index: number, quantity: string) => {
        const updated = [...ingredients];
        updated[index].quantity = quantity;
        onIngredientsChange(updated);
    };

    const handleNameChange = (index: number, name: string) => {
        const updated = [...ingredients];
        updated[index].name = name;
        onIngredientsChange(updated);
    };

    const filteredIngredients = allIngredients.filter((ing) =>
        ing.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-slate-300">Ingredients</label>
                <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                >
                    <FiPlus size={18} />
                    Add Ingredient
                </button>
            </div>

            {ingredients.length === 0 && (
                <div className="rounded-lg border border-slate-600/50 bg-slate-700/20 p-6 text-center">
                    <p className="text-slate-400 mb-3">No ingredients added yet</p>
                    <button
                        type="button"
                        onClick={handleAddIngredient}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 font-semibold text-sm hover:bg-slate-700 transition-all"
                    >
                        <FiPlus size={18} />
                        Add Your First Ingredient
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-3 items-start p-4 rounded-lg border border-slate-600/50 bg-slate-700/20">
                        <div className="flex-1 space-y-2">
                            
                            <div className="relative" ref={index === showDropdown ? dropdownRef : undefined}>
                                <label className="text-xs font-semibold text-slate-400 mb-1 block">Ingredient Name *</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={ingredient.name}
                                        onChange={(e) => {
                                            if (ingredient.isNew) {
                                                handleNameChange(index, e.target.value);
                                                setSearchQuery(e.target.value);
                                                setShowDropdown(index);
                                            }
                                        }}
                                        onFocus={() => {
                                            if (!ingredient.isNew) {
                                                setShowDropdown(index);
                                                setSearchQuery(ingredient.name);
                                            }
                                        }}
                                        placeholder="Select or type ingredient..."
                                        readOnly={!ingredient.isNew}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-600/50 bg-slate-700/30 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:bg-slate-700/50 transition-all text-sm"
                                    />
                                    <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                </div>

                                
                                {showDropdown === index && ingredient.isNew && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600/50 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                        {filteredIngredients.length === 0 ? (
                                            <div className="p-3 text-sm text-slate-400 text-center">
                                                {loadingIngredients ? "Loading..." : "No ingredients found"}
                                            </div>
                                        ) : (
                                            filteredIngredients.map((ing) => (
                                                <button
                                                    key={ing.id}
                                                    type="button"
                                                    onClick={() => handleSelectIngredient(ing, index)}
                                                    className="w-full text-left px-4 py-2 hover:bg-slate-700/50 text-slate-100 text-sm transition-colors border-b border-slate-700/30 last:border-b-0"
                                                >
                                                    {ing.name}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            
                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1 block">Quantity (e.g., 2 cups, 500g)</label>
                                <input
                                    type="text"
                                    value={ingredient.quantity}
                                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                                    placeholder="e.g., 2 cups, 500g"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-600/50 bg-slate-700/30 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:bg-slate-700/50 transition-all text-sm"
                                />
                            </div>
                        </div>

                       
                        <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="mt-6 p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-all"
                            title="Remove ingredient"
                        >
                            <FiTrash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
