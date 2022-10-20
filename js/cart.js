const userID = 25801
let itemCart = [];//array con items a mostrar en el carrito
let localCart = [];
let cartOrdened = [];

function getCartProducts(data){
    let HTMLContentToAppend = '';
    let artCount = 0;
    data.forEach(element => {
        //converción a dolar
        if (element.currency != 'USD'){
            element.unitCost = Math.round(element.unitCost/ 40);
        }
        HTMLContentToAppend += `
        <tr>
            <th scope="row"><img src="${element.image}" width="50rem" alt=""></th>
            <td>${element.name}</td>
            <td> USD ${element.unitCost}</td>
            <td><input id=cantN${artCount} type="number" value="${element.count ?? 1}" min="1" max="100" oninput="getSubTotal(${element.unitCost},${artCount})"></td>
            <td> USD <span id=itemN${artCount}>${element.unitCost * element.count}</span></td>
        </tr>
        `
        artCount++
    });

    return HTMLContentToAppend;
}

function getSubTotal(unitCost,id){
    let multiplo = document.getElementById('cantN'+id).value;
    let subtotal = unitCost * multiplo;
    document.getElementById('itemN'+id).innerHTML = subtotal;
    document.getElementById('sub-total').innerHTML = getFinishSubTotal(localCart);
    document.getElementById('total').innerHTML = getTotal();
}

function getFinishSubTotal(arry){
    let addSubtotal = 0;
    for (let i = 0; i < localCart.length; i++) {
        let cost = document.getElementById('itemN'+i).textContent;
        addSubtotal += parseInt(cost);
    }
    return addSubtotal;
}

function getSendingPrice(){
    let selectedOption = document.querySelector('input[name="sendingType"]:checked').value;
    let result = (parseInt(document.getElementById('sub-total').textContent) * selectedOption) / 100;
    return Math.round(result);
}

function getTotal(){
    let subtotal = parseInt(document.getElementById('sub-total').textContent);
    let sendingPrice = parseInt(document.getElementById('sending').textContent);
    return subtotal+sendingPrice;
}

document.addEventListener('DOMContentLoaded',async ()=>{
    const itemsContainer = document.getElementById('cartItems');
    const cartData = await getJSONData(CART_INFO_URL + userID + EXT_TYPE);
    localCart = cartData.data.articles;
    
    const subtotal = document.getElementById('sub-total');
    const sending = document.getElementById('sending');
    const total = document.getElementById('total');
    const selectSending = document.getElementById('sendingType');

    const viewPaymentMethod = document.getElementById('viewPaymentMethod');
    const paymentMethod = document.getElementById('paymentMethod');
    const typeSaved = document.getElementById('typeSaved');

    const creditCard = document.getElementById('creditCard');
    const accountNumb = document.getElementById('accountNumb');
    const wireTransf = document.getElementById('wireTransf');
    const cardId = document.getElementById('cardId');
    const cardSec = document.getElementById('cardSec');
    const cardExpir = document.getElementById('cardExpir');


    //si existen productos en el carrito local, los pushea al array para imprimirlos - desafiate 5
    if(localStorage.getItem('localCart')){
        let ItemsObj = JSON.parse(localStorage.getItem('localCart'))
        ItemsObj.forEach(element => {
            localCart.push(element);
        });
    }
    itemsContainer.innerHTML = getCartProducts(localCart);

    //Obtener los precios
    subtotal.innerHTML = getFinishSubTotal(localCart);
    sending.innerHTML = getSendingPrice();
    total.innerHTML = getTotal();

    selectSending.addEventListener('click',()=>{
        sending.innerHTML = getSendingPrice();
        total.innerHTML = getTotal();
    })

    creditCard.addEventListener('click',()=>{
        accountNumb.disabled = true;
        cardId.disabled = false;
        cardSec.disabled = false;
        cardExpir.disabled = false;
    })

    wireTransf.addEventListener('click',()=>{
        cardId.disabled = true;
        cardSec.disabled = true;
        cardExpir.disabled = true;
        accountNumb.disabled = false;
        accountNumb.required = true;
    })

    typeSaved.addEventListener('click',()=>{
        const methodSelected = document.querySelector('input[name="paymentMethod"]:checked').value;
        if (methodSelected == 'Tarjeta de crédito') {
            let paymentData = {
                cardNumber : cardId.value,
                securityCode : cardSec.value,
                expiration : cardExpir.value
            }
            console.log(paymentData);
        }
        
        if (methodSelected == 'Transferencia bancaria'){
            let paymentData = {
                accountNumber : accountNumb.value
            }
            console.log(paymentData);
        }
        viewPaymentMethod.innerHTML = methodSelected
    })
    

})

