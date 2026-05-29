'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiX, FiEdit2, FiTrash2, FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { Ingredient, IngredientDetails } from '@/lib/types';


export default function IngredientsPage() {
  const { data: session, status } = useSession();
  const isAdmin = status === 'authenticated' && (session?.user as any)?.role === 'ADMIN';

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValue, setFormValue] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<IngredientDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  
  const fetchIngredients = async (query?: string) => {
    try {
      setLoading(true);
      const url = query
        ? `/api/ingredients?name=${encodeURIComponent(query)}`
        : '/api/ingredients';
      const res = await fetch(url, { cache: 'no-store' });
      const payload = await res.json();

      if (!res.ok) {
        setError(payload?.err || 'Failed to load ingredients.');
        return;
      }

      const list = Array.isArray(payload?.data) ? payload.data : [];
      setIngredients(list);
    } catch {
      setError('Failed to load ingredients.');
    } finally {
      setLoading(false);
    }
  };

  
  const fetchIngredientDetails = async (id: number) => {
    try {
      setLoadingDetails(true);
      const res = await fetch(`/api/ingredients/${id}`, { cache: 'no-store' });
      const payload = await res.json();

      if (!res.ok) {
        toast.error('Failed to load ingredient details');
        return;
      }

      setExpandedDetails(payload?.data);
    } catch {
      toast.error('Failed to load ingredient details');
    } finally {
      setLoadingDetails(false);
    }
  };

  
  const handleToggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedDetails(null);
    } else {
      setExpandedId(id);
      fetchIngredientDetails(id);
    }
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValue.trim()) {
      toast.error('Please enter an ingredient name');
      return;
    }

    toast.loading(editingId ? 'Updating...' : 'Adding...', { id: 'ingredient' });

    try {
      const url = editingId ? `/api/ingredients/${editingId}` : '/api/ingredients';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formValue.trim() }),
      });

      const payload = await res.json();

      if (!res.ok) {
        toast.error(payload?.err || 'Operation failed', { id: 'ingredient' });
        return;
      }

      toast.success(editingId ? 'Updated successfully!' : 'Added successfully!', {
        id: 'ingredient',
      });

      setFormValue('');
      setEditingId(null);
      setShowModal(false);
      fetchIngredients(search);
    } catch {
      toast.error('Operation failed', { id: 'ingredient' });
    }
  };

  
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) return;

    toast.loading('Deleting...', { id: 'delete' });

    try {
      const res = await fetch(`/api/ingredients/${id}`, { method: 'DELETE' });
      const payload = await res.json();

      if (!res.ok) {
        toast.error(payload?.err || 'Failed to delete', { id: 'delete' });
        return;
      }

      toast.success('Deleted successfully!', { id: 'delete' });
      fetchIngredients(search);
    } catch {
      toast.error('Failed to delete', { id: 'delete' });
    }
  };

  
  useEffect(() => {
    fetchIngredients(search);
  }, [search]);

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      Easy: 'text-green-600 bg-green-50',
      Medium: 'text-yellow-600 bg-yellow-50',
      Hard: 'text-red-600 bg-red-50',
    };
    return colors[difficulty] || 'text-gray-600 bg-gray-50';
  };

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-6xl'>
        {/* Header */}
        <div className='flex items-end justify-between gap-4 mb-8'>
          <div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent'>
              Ingredients
            </h1>
            <p className='mt-2 text-gray-400'>
              Browse and manage all available ingredients for your recipes.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormValue('');
                setShowModal(true);
              }}
              className='flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap'
            >
              <FiPlus size={20} />
              <span>Add Ingredient</span>
            </button>
          )}
        </div>

        
        <div className='mb-8 relative'>
          <FiSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' size={20} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search ingredients...'
            className='w-full pl-12 pr-4 py-3 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-all duration-200'
          />
        </div>

        
        {loading && (
          <div className='text-center py-12'>
            <div className='inline-block w-12 h-12 border-4 border-gray-700 border-t-violet-500 rounded-full animate-spin mb-4' />
            <p className='text-gray-400'>Loading ingredients...</p>
          </div>
        )}

        {!loading && error && (
          <div className='bg-red-900/20 border-2 border-red-500/50 rounded-lg p-6 text-center'>
            <p className='text-red-400 font-semibold'>{error}</p>
          </div>
        )}

        {!loading && !error && ingredients.length === 0 && (
          <div className='bg-slate-800 border-2 border-slate-700 rounded-lg p-12 text-center'>
            <p className='text-gray-400 text-lg'>No ingredients found.</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className='mt-4 text-violet-400 hover:text-violet-300 font-semibold'
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && !error && ingredients.length > 0 && (
          <div className='grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
            {ingredients.map((ingredient) => (
              <div key={ingredient.id} className='bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-violet-500 transition-all duration-300'>
                {/* Card Header */}
                <div className='p-5'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex-1'>
                      <h2 className='text-xl font-bold text-white'>{ingredient.name}</h2>
                      <p className='text-sm text-gray-400 mt-1'>
                        {ingredient._count?.recipes ?? 0} recipe{ingredient._count?.recipes !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {isAdmin && (
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => {
                            setFormValue(ingredient.name);
                            setEditingId(ingredient.id);
                            setShowModal(true);
                          }}
                          className='p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-all duration-200'
                          title='Edit'
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(ingredient.id)}
                          className='p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-all duration-200'
                          title='Delete'
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                
                {(ingredient._count?.recipes ?? 0) > 0 && (
                  <button
                    onClick={() => handleToggleExpand(ingredient.id)}
                    className={`w-full px-5 py-3 text-left flex items-center justify-between border-t border-slate-700 bg-slate-700/30 hover:bg-slate-700/60 transition-all duration-200 text-gray-300 font-semibold ${
                      expandedId === ingredient.id ? 'bg-slate-700/60' : ''
                    }`}
                  >
                    <span>View Recipes</span>
                    <FiChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${
                        expandedId === ingredient.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}

                
                {expandedId === ingredient.id && (
                  <div className='border-t border-slate-700 p-5 bg-slate-900/50 space-y-3 max-h-96 overflow-y-auto'>
                    {loadingDetails ? (
                      <p className='text-gray-400 text-center py-4'>Loading recipes...</p>
                    ) : expandedDetails && expandedDetails.recipes && expandedDetails.recipes.length > 0 ? (
                      expandedDetails.recipes.map((recipeItem) => (
                        <Link
                          key={recipeItem.id}
                          href={`/recipes/${recipeItem.recipeId}`}
                          className='block p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all duration-200 cursor-pointer group'
                        >
                          <div className='flex items-start gap-3'>
                            {recipeItem.recipe.imageUrl && (
                              <img
                                src={recipeItem.recipe.imageUrl}
                                alt={recipeItem.recipe.title}
                                className='w-12 h-12 rounded object-cover flex-shrink-0 group-hover:scale-110 transition-transform duration-200'
                              />
                            )}
                            <div className='flex-1 min-w-0'>
                              <h4 className='font-semibold text-white truncate group-hover:text-violet-400 transition-colors'>
                                {recipeItem.recipe.title}
                              </h4>
                              <div className='flex items-center gap-2 mt-1'>
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded ${getDifficultyColor(
                                    recipeItem.recipe.difficulty
                                  )}`}
                                >
                                  {recipeItem.recipe.difficulty}
                                </span>
                                {recipeItem.quantity && (
                                  <span className='text-xs text-gray-400'>{recipeItem.quantity}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className='text-gray-400 text-center py-2'>No recipes yet</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      
      {showModal && isAdmin && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full shadow-2xl'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-2xl font-bold text-white'>
                {editingId ? 'Edit Ingredient' : 'Add New Ingredient'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setFormValue('');
                }}
                className='p-2 hover:bg-slate-700 rounded-lg transition-colors'
              >
                <FiX size={20} className='text-gray-400' />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label htmlFor='name' className='block text-sm font-semibold text-gray-300 mb-2'>
                  Ingredient Name
                </label>
                <input
                  id='name'
                  type='text'
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder='e.g., Tomato, Garlic, Olive Oil'
                  className='w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-all duration-200'
                  autoFocus
                />
              </div>

              <div className='flex gap-3 pt-4'>
                <button
                  type='submit'
                  className='flex-1 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-bold py-2 rounded-lg transition-all duration-300'
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setFormValue('');
                  }}
                  className='flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg transition-all duration-300'
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
