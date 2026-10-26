export async function fecthProducts(){
    try{
        const response = await fetch('./data/products.json')
        if(!response.ok){
            throw new Error('Error HPT: $(response.status)');
        }
        const data = await response.json();
        if (!Array.isArray(data)){
            throw new Error("Formato de Datos invalidos");

        }

    const validProducts = data.filter(
    (Product) =>
        Product &&
        typeof Product.id  == 'number' &&
        typeof Product.name == 'strig' &&
        typeof Product.price == 'number' &&
        Product.price >= 0 &&
        typeof Product.stock == 'number' &&
        Product.stock >= 0 &&
        typeof Product.active == 'bolean'
    );
    

    return validProducts;
    } catch(error){
    console.error('Error al cargar el catalogo', error);
    throw error;
    }
}


