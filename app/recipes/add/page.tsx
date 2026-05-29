"use client";

import { ChangeEvent, JSX, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $setBlocksType } from "@lexical/selection";
import { AutoLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $createHeadingNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import {
    INSERT_CHECK_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    ListItemNode,
    ListNode,
    REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
    $createParagraphNode,
    $getSelection,
    $insertNodes,
    $isRangeSelection,
    COMMAND_PRIORITY_EDITOR,
    DecoratorNode,
    EditorState,
    LexicalNode,
    LexicalCommand,
    LexicalEditor,
    DOMConversionMap,
    DOMConversionOutput,
    NodeKey,
    SerializedLexicalNode,
    createCommand,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
    REDO_COMMAND,
    UNDO_COMMAND,
} from "lexical";
import {
    FiAlignCenter,
    FiAlignLeft,
    FiAlignRight,
    FiBold,
    FiCode,
    FiImage,
    FiItalic,
    FiLink,
    FiList,
    FiMenu,
    FiRotateCcw,
    FiRotateCw,
    FiType,
    FiUnderline,
} from "react-icons/fi";
import { Category, RecipeFormValues } from "@/lib/types";
import IngredientSelector from "@/app/components/IngredientSelector";
import { SelectedIngredient } from "@/lib/interfaces";


const INSERT_IMAGE_COMMAND: LexicalCommand<string> = createCommand("INSERT_IMAGE_COMMAND");

type SerializedImageNode = SerializedLexicalNode & {
    src: string;
    type: "image";
    version: 1;
};

class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string;

    static getType(): string {
        return "image";
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(node.__src, node.__key);
    }

    static importJSON(serializedNode: SerializedLexicalNode): LexicalNode {
        const node = serializedNode as SerializedImageNode;
        return new ImageNode(node.src);
    }

    static importDOM(): DOMConversionMap | null {
        return {
            img: () => ({
                conversion: (domNode: Node): DOMConversionOutput | null => {
                    if (!(domNode instanceof HTMLImageElement)) return null;
                    const src = domNode.getAttribute("src");
                    if (!src) return null;
                    return { node: new ImageNode(src) };
                },
                priority: 1,
            }),
        };
    }

    constructor(src: string, key?: NodeKey) {
        super(key);
        this.__src = src;
    }

    exportJSON(): SerializedImageNode {
        return {
            ...super.exportJSON(),
            type: "image",
            version: 1,
            src: this.__src,
        };
    }

    createDOM(): HTMLElement {
        return document.createElement("span");
    }

    updateDOM(): false {
        return false;
    }

    exportDOM(): { element: HTMLElement } {
        const element = document.createElement("img");
        element.setAttribute("src", this.__src);
        element.setAttribute("alt", "Recipe step image");
        element.setAttribute("style", "max-width:100%;height:auto;display:block;margin:12px 0;");
        return { element };
    }

    decorate(): JSX.Element {
        return (
            <img src={this.__src} alt="Recipe content" className="my-3 h-auto max-w-full rounded-md" />
        );
    }
}

const $createImageNode = (src: string) => new ImageNode(src);

const theme = {
    paragraph: "mb-3",
    text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        strikethrough: "line-through",
        code: "rounded bg-gray-800 px-1 py-0.5 font-mono text-sm text-gray-100",
    },
    quote: "border-l-4 border-gray-500 pl-3 italic text-gray-300",
    heading: {
        h2: "mb-2 text-2xl font-semibold",
        h3: "mb-2 text-xl font-semibold",
    },
    list: {
        ul: "list-disc pl-6",
        ol: "list-decimal pl-6",
        listitem: "mb-1",
        nested: {
            listitem: "mt-1",
        },
    },
    link: "text-blue-300 underline",
};

const editorConfig = {
    namespace: "RecipeEditor",
    theme,
    nodes: [ImageNode, HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode],
    onError(error: Error) {
        throw error;
    },
};

const ToolbarPlugin = () => {
    const [editor] = useLexicalComposerContext();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [blockType, setBlockType] = useState("paragraph");

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;
                const anchorNode = selection.anchor.getNode();
                const topLevelElement = anchorNode.getTopLevelElementOrThrow();
                const nodeType = topLevelElement.getType();
                setBlockType(nodeType);
            });
        });
    }, [editor]);

    const insertImageByUrl = () => {
        const url = window.prompt("Paste image URL");
        if (!url || !url.trim()) return;
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, url.trim());
    };

    const insertImageByFile = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                toast.error(data.error || "Failed to upload image");
                return;
            }

            editor.dispatchCommand(INSERT_IMAGE_COMMAND, data.url);
        } catch (err) {
            toast.error("Failed to upload image");
        }

        event.target.value = "";
    };

    const handleBlockTypeChange = (value: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            if (value === "paragraph") {
                $setBlocksType(selection, () => $createParagraphNode());
                return;
            }
            if (value === "quote") {
                $setBlocksType(selection, () => new QuoteNode());
                return;
            }
            if (value === "h2" || value === "h3") {
                $setBlocksType(selection, () => $createHeadingNode(value));
            }
        });
    };

    const insertOrEditLink = () => {
        const url = window.prompt("Enter URL (leave empty to remove link)");
        if (url === null) return;
        const trimmed = url.trim();
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, trimmed || null);
    };

    const buttonClass = "inline-flex h-8 w-8 items-center justify-center rounded border border-slate-600/50 bg-slate-700/30 text-slate-300 hover:bg-slate-700/60 hover:text-slate-100 transition-colors";
    const groupClass = "flex items-center gap-1 rounded-md border border-slate-600/50 bg-slate-700/20 p-1";

    return (
        <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-slate-600/50 pb-3">
            <select
                value={blockType}
                onChange={(e) => handleBlockTypeChange(e.target.value)}
                className="h-8 rounded border border-slate-600/50 bg-slate-700/30 px-2 text-xs text-slate-300 cursor-pointer hover:bg-slate-700/60"
            >
                <option value="paragraph">Normal</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="quote">Blockquote</option>
            </select>
            <div className={groupClass}>
                <button type="button" title="Bold" className={buttonClass} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}><FiBold size={14} /></button>
                <button type="button" title="Italic" className={buttonClass} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}><FiItalic size={14} /></button>
                <button type="button" title="Underline" className={buttonClass} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}><FiUnderline size={14} /></button>
                <button type="button" title="Strikethrough" className={buttonClass} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}><FiType size={14} /></button>
                <button type="button" title="Code" className={buttonClass} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}><FiCode size={14} /></button>
            </div>
            <div className={groupClass}>
                <button type="button" title="Align Left" className={buttonClass} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}><FiAlignLeft size={14} /></button>
                <button type="button" title="Align Center" className={buttonClass} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}><FiAlignCenter size={14} /></button>
                <button type="button" title="Align Right" className={buttonClass} onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}><FiAlignRight size={14} /></button>
            </div>
            <div className={groupClass}>
                <button type="button" title="Bullet List" className={buttonClass} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}><FiList size={14} /></button>
                <button type="button" title="Numbered List" className={buttonClass} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}><FiMenu size={14} /></button>
                <button type="button" title="Check List" className={buttonClass} onClick={() => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)}>CL</button>
                <button type="button" title="Clear List" className={buttonClass} onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}>X</button>
            </div>
            <div className={groupClass}>
                <button type="button" title="Indent" className={buttonClass} onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}>{">"}</button>
                <button type="button" title="Outdent" className={buttonClass} onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}>{"<"}</button>
                <button type="button" title="Link" className={buttonClass} onClick={insertOrEditLink}><FiLink size={14} /></button>
                <button type="button" title="Image URL" className={buttonClass} onClick={insertImageByUrl}><FiImage size={14} /></button>
                <button type="button" title="Upload Image" className={buttonClass} onClick={() => fileInputRef.current?.click()}>UP</button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={insertImageByFile} />
            <div className={groupClass}>
                <button type="button" title="Undo" className={buttonClass} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}><FiRotateCcw size={14} /></button>
                <button type="button" title="Redo" className={buttonClass} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}><FiRotateCw size={14} /></button>
            </div>
        </div>
    );
};

const ImagePlugin = () => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerCommand(
            INSERT_IMAGE_COMMAND,
            (payload) => {
                editor.update(() => {
                    const imageNode = $createImageNode(payload);
                    $insertNodes([imageNode, $createParagraphNode()]);
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    return null;
};

const scoreRecipeCompleteness = (values: Partial<RecipeFormValues>, hasSteps: boolean, hasImage: boolean) => {
    let score = 0;
    if (values.title?.trim()) score += 20;
    if (values.description?.trim()) score += 15;
    if (hasSteps) score += 30;
    if (values.cookingTime && values.cookingTime > 0) score += 10;
    if (values.cuisine?.trim()) score += 10;
    if (values.categoryId) score += 10;
    if (hasImage) score += 5;
    return Math.min(score, 100);
};

export default function AddRecipePage() {
    const { data: session } = useSession();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [previewImage, setPreviewImage] = useState("");
    const [preparationHtml, setPreparationHtml] = useState("");
    const [ingredients, setIngredients] = useState<SelectedIngredient[]>([]);

    const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<RecipeFormValues>({
        defaultValues: { difficulty: "Easy" },
    });

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await fetch("/api/categories", { cache: "no-store" });
                const contentType = res.headers.get("content-type") || "";
                const payload = contentType.includes("application/json") ? await res.json() : null;
                if (!res.ok) {
                    toast.error(payload?.err || "Could not load categories.");
                    return;
                }
                const list = Array.isArray(payload?.data) ? payload.data : [];
                setCategories(list);
            } catch {
                toast.error("Could not load categories.");
            } finally {
                setIsLoadingCategories(false);
            }
        };
        void loadCategories();
    }, []);

    const watchedValues = watch();
    const hasImage = Boolean(watchedValues.image?.[0]);
    const hasSteps = preparationHtml.replace(/<[^>]*>/g, "").trim().length > 0;
    const completeness = useMemo(
        () => scoreRecipeCompleteness(watchedValues, hasSteps, hasImage),
        [watchedValues, hasSteps, hasImage]
    );

    const handleEditorChange = (editorState: EditorState, editor: LexicalEditor) => {
        editorState.read(() => {
            const html = $generateHtmlFromNodes(editor, null);
            setPreparationHtml(html);
        });
    };

    const onSubmit = async (values: RecipeFormValues) => {
        const userId = Number((session?.user as { id?: string } | undefined)?.id);
        if (!userId || !Number.isInteger(userId)) {
            toast.error("Please sign in to publish a recipe.");
            return;
        }
        if (!hasSteps) {
            toast.error("Preparation steps are required.");
            return;
        }

        const recipeData = {
            userId,
            title: values.title.trim(),
            description: values.description?.trim() || null,
            preparationSteps: preparationHtml,
            cookingTime: values.cookingTime ? Number(values.cookingTime) : null,
            difficulty: values.difficulty,
            cuisine: values.cuisine?.trim() || null,
            categoryId: values.categoryId ? Number(values.categoryId) : null,
        };

        const formData = new FormData();
        formData.append("recipeData", JSON.stringify(recipeData));
        if (values.image?.[0]) {
            formData.append("image", values.image[0]);
        }

        const toastId = "create-recipe";
        toast.loading("Publishing recipe...", { id: toastId });

        try {
            const response = await fetch("/api/recipes", {
                method: "POST",
                body: formData,
            });
            const contentType = response.headers.get("content-type") || "";
            const payload = contentType.includes("application/json") ? await response.json().catch(() => null) : null;

            if (!response.ok) {
                toast.error(payload?.err || payload?.message || "Failed to create recipe.", { id: toastId });
                return;
            }

            const recipeId = payload?.data?.id;

            if (recipeId && ingredients.length > 0) {
                const ingredientPromises = ingredients
                    .filter(ing => ing.id)
                    .map(ing =>
                        fetch("/api/recipe-ingredients", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                recipeId,
                                ingredientId: ing.id,
                                quantity: ing.quantity.trim() || null,
                            }),
                        })
                    );

                await Promise.all(ingredientPromises).catch(() => {
                    console.error("Failed to link some ingredients");
                });
            }

            toast.success("Recipe published successfully.", { id: toastId });
            
            setIngredients([]);
            setPreparationHtml("");
        } catch {
            toast.error("Failed to create recipe.", { id: toastId });
        }
    };

    const placeholder = useMemo(
        () => (
            <p className="pointer-events-none absolute top-3 left-3 text-sm text-gray-500">
                Write your preparation steps here...
            </p>
        ),
        []
    );

    return (
        <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
            
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl opacity-30 animate-pulse animation-delay-2000" />
            </div>

            <div className="relative mx-auto max-w-6xl">
                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">
                        <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 bg-clip-text text-transparent">
                            Create New Recipe
                        </span>
                    </h1>
                    <p className="text-lg text-slate-400">Upload your own recipe image and craft rich preparation steps.</p>
                </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-8 lg:col-span-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-300">Recipe Title *</label>
                            <input 
                                className="w-full rounded-lg border border-slate-600/50 bg-slate-700/30 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-pink-500/50 focus:bg-slate-700/50" 
                                placeholder="Enter recipe title"
                                {...register("title", { required: true })} 
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-300">Cuisine</label>
                                <input 
                                    className="w-full rounded-lg border border-slate-600/50 bg-slate-700/30 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-pink-500/50 focus:bg-slate-700/50" 
                                    placeholder="e.g., Italian, Asian"
                                    {...register("cuisine")} 
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-300">Cooking Time (mins)</label>
                                <input 
                                    type="number" 
                                    className="w-full rounded-lg border border-slate-600/50 bg-slate-700/30 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-pink-500/50 focus:bg-slate-700/50" 
                                    placeholder="30"
                                    {...register("cookingTime", { valueAsNumber: true })} 
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-300">Difficulty *</label>
                                <select 
                                    className="w-full rounded-lg border border-slate-600/50 bg-slate-700/30 px-4 py-3 text-slate-100 outline-none transition-colors focus:border-pink-500/50 focus:bg-slate-700/50 cursor-pointer" 
                                    {...register("difficulty", { required: true })}>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-300">Category</label>
                                <select 
                                    className="w-full rounded-lg border border-slate-600/50 bg-slate-700/30 px-4 py-3 text-slate-100 outline-none transition-colors focus:border-pink-500/50 focus:bg-slate-700/50 cursor-pointer" 
                                    disabled={isLoadingCategories} 
                                    {...register("categoryId", { valueAsNumber: true })}>
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-300">Recipe Image Upload</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full rounded-lg border border-slate-600/50 bg-slate-700/30 px-4 py-3 text-sm text-slate-100 outline-none transition-colors focus:border-pink-500/50 focus:bg-slate-700/50 file:mr-3 file:rounded-md file:border-0 file:bg-gradient-to-r file:from-pink-500 file:to-rose-500 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:opacity-90"
                                {...register("image", {
                                    onChange: (event) => {
                                        const file = event.target.files?.[0];
                                        setPreviewImage(file ? URL.createObjectURL(file) : "");
                                    },
                                })}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-300">Description</label>
                            <textarea 
                                rows={4} 
                                className="w-full rounded-lg border border-slate-600/50 bg-slate-700/30 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-pink-500/50 focus:bg-slate-700/50 resize-none" 
                                placeholder="Brief description of your recipe"
                                {...register("description")} 
                            />
                        </div>

                        <div>
                            <IngredientSelector 
                                ingredients={ingredients}
                                onIngredientsChange={setIngredients}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-300">Preparation Steps *</label>
                            <LexicalComposer initialConfig={editorConfig}>
                                <div className="relative rounded-lg border border-slate-600/50 bg-slate-700/20 overflow-hidden">
                                    <ToolbarPlugin />
                                    <div className="relative">
                                        <RichTextPlugin
                                            contentEditable={<ContentEditable className="min-h-64 rounded-md border border-slate-600/50 bg-slate-900/50 p-4 text-slate-100 outline-none focus:border-pink-500/50" />}
                                            placeholder={placeholder}
                                            ErrorBoundary={LexicalErrorBoundary}
                                        />
                                    </div>
                                    <HistoryPlugin />
                                    <ListPlugin />
                                    <LinkPlugin />
                                    <ImagePlugin />
                                    <OnChangePlugin onChange={handleEditorChange} />
                                </div>
                            </LexicalComposer>
                        </div>

                    <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/50 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50">
                        {isSubmitting ? "Publishing..." : "Publish Recipe"}
                    </button>
                </form>

                <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-6">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Completeness Score</p>
                        <p className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-4">{completeness}%</p>
                        <div className="h-2 w-full rounded-full bg-slate-700/50">
                            <div className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all" style={{ width: `${completeness}%` }} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm p-6">
                        <p className="text-sm font-semibold text-slate-300 mb-4">Image Preview</p>
                        <div className="overflow-hidden rounded-lg border border-slate-600/50 bg-slate-900/50">
                            {previewImage ? (
                                <img src={previewImage} alt="Recipe preview" className="h-48 w-full object-cover" />
                            ) : (
                                <div className="flex h-48 items-center justify-center text-sm text-slate-500">Upload image to preview</div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}
