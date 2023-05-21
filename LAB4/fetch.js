fetch('products.json') 
    .then(response => {
        if(!response.ok) {
            throw new Error(`HTTP error : ${response.status}`);
        }
        return response.json();
    })
    .then(json => initialize(json))
    .catch(err => console.error(`Fetch Problem : ${err.message}`));

function initialize(products) {
    const prodcg = document.querySelector('#productCategory');
    const prodsc = document.querySelector('#productSearch');
    const prodsr = document.querySelector('#productSort');
    const scbutton = document.getElementById("button");
    const main = document.querySelector('main');
    const sc = prodsc.value || '';

    let lastCg = prodcg.value;
    let lastSc = '';
    let cgArr;
    let resArr;

    resArr = products;
    updateDisplay();

    cgArr = [];
    resArr = [];

    scbutton.addEventListener('click', selectcg);
    
    function selectcg(e){
        e.preventDefault();

        cgArr = [];
        resArr = [];

        if(prodcg.value === lastCg && sc.trim() === lastSc) {
            return;
        }
        else {
            lastCg = prodcg.value;
            lastSc = sc.trim();
            if(prodcg.value === 'ALL') {
                cgArr = products;
                selectProducts();
            }
            else {
                const lcType = sc.toLowerCase();
                selectProducts();
            }
        }
    }

    function selectProducts() {
        if(sc.trim() === '') {
            resArr = cgArr;
        }
        else {
            const lcSearch = sc.trim().toLowerCase();
            resArr = cgArr.filter(product => product.name.includes(lcSearch));
        }
        updateDisplay();
    }

    function updateDisplay(){
        while(main.firstChild) {
            main.removeChild(main.firstChild);
        }

        if(resArr.length === 0) {
            const p = document.createElement('p');
            main.appendChild(p);
        }
        else {
            for(const product of resArr) {
                fetchBlob(product);
            }
        }
    }

    function fetchBlob(product) {
        const url = `images/${product.image}`;
        fetch(url)
            .then( response => {
                if(!response.ok) {
                    throw new Error(`HTTP error : ${response.status}`);
                }
                return response.blob();
            })
            .then( blob => showProduct(blob, product) )
            .catch( err => console.error(`Fetch problem : ${err.message}`));
    }

    function showProduct(blob, product) {
        const objURL = URL.createObjectURL(blob);
        const section = document.createElement('section');
        const h = document.createElement('h2');
        const par = document.createElement('p');
        const image = document.createElement('img');

        section.setAttribute('class', product.type);
        h.textContent = product.name.replace(product.name.charAt(0), product.name.charAt(0).toUpperCase());
        par.textContent = `$${product.price}`;
        image.src = objURL;
        image.alt = product.name;
        main.appendChild(section);
        section.appendChild(h);
        section.appendChild(par);
        section.appendChild(image);
    }

}

