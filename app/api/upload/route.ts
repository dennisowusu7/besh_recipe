import { UploadApiResponse, v2 } from "cloudinary";

async function uploadImage(file: Blob): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>(async (resolve, reject) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        v2.uploader
            .upload_stream({ resource_type: "auto", folder: "besh-recipes" }, (error, result) => {
                if (error) return reject(error);
                if (result) return resolve(result);
                return reject(new Error("No upload result"));
            })
            .end(buffer);
    });
}

export const POST = async (req: Request) => {
    try {
        v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const formData = await req.formData();
        const file = formData.get("image") as Blob | null;

        if (!file) {
            return Response.json({ error: "No image provided" }, { status: 400 });
        }

        const uploadedFile = await uploadImage(file);
        return Response.json({ url: uploadedFile.url }, { status: 200 });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return Response.json({ error: errorMessage }, { status: 500 });
    }
};
