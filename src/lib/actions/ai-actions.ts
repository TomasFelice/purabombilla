'use server'

import { MultiProviderGenerator } from "@/lib/ai/ai-service";

const aiGenerator = new MultiProviderGenerator();

export async function generateProductDescription(productName: string, category: string, additionalContext?: string) {
    try {
        let prompt = `Escribe una descripción atractiva y vendedora para un producto de e-commerce llamado "${productName}" que pertenece a la categoría "${category}".`;

        if (additionalContext) {
            prompt += `\n INFORMACIÓN ADICIONAL DEL PRODUCTO: ${additionalContext}. Usa esta información para enriquecer la descripción.`;
        }

        prompt += `\n El tono debe ser premium, moderno, argentino, divertido y cercano.
    La descripción debe tener entre 2 y 3 oraciones. 
    Destaca la calidad y el estilo.`;

        const text = await aiGenerator.generateText(prompt);
        return { text };

    } catch (error) {
        console.error("Error generating description:", error);
        return { error: "Error al generar la descripción con todos los proveedores." };
    }
}


