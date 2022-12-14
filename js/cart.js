const userID = 25801
let localCart = []; //array con items a mostrar en el carrito

//actualiza los costos.
function itemsCostUpDate (){
    document.getElementById('sub-total').innerHTML = getFinishSubTotal(localCart);
    document.getElementById('sending').innerHTML = getSendingPrice();
    document.getElementById('total').innerHTML = getTotal();
}

function eraseItem(cartItemId, itemId){
    let itemToErase = document.getElementById('itemN'+cartItemId);
    itemToErase.innerHTML = '';
    let localStorageItems = JSON.parse(localStorage.getItem('localCart'))
    let notErasedItems = localStorageItems.filter(i => i.id !== itemId );
    localStorage.setItem('localCart', JSON.stringify(notErasedItems));
    //actualiza los precios, ahora sin los items borrados.
    localCart = notErasedItems;
    document.getElementById('cartItems').innerHTML = getCartProducts(localCart);
    itemsCostUpDate();
}

function getCartProducts(data){
    let HTMLContentToAppend = '';
    let artCount = 0;
    data.forEach(element => {
        //converción a dolar
        if (element.currency != 'USD'){
            element.unitCost = Math.round(element.unitCost/ 40);
        }
        HTMLContentToAppend += `
        <tr id="itemN${artCount}">
            <th scope="row"><img src="${element.image}" width="50rem" alt=""></th>
            <td>${element.name}</td>
            <td> USD ${element.unitCost}</td>
            <td><input id=cantN${artCount} type="number" value="${element.count ?? 1}" min="1" max="100" oninput="getSubTotal(${element.unitCost},${artCount})"></td>
            <td> USD <span id=costItemN${artCount}>${element.unitCost * element.count}</span></td>
            <td> <i class="bi bi-trash3 btn btn-outline-danger" onclick="eraseItem(${artCount}, ${element.id})"></i> </td>
        </tr>
        `
        artCount++
    });
    return HTMLContentToAppend;
}

function getSubTotal(unitCost,id){
    let multiplo = document.getElementById('cantN'+id).value;
    let subtotal = unitCost * multiplo;
    document.getElementById('costItemN'+id).innerHTML = subtotal;
    itemsCostUpDate();
}

function getFinishSubTotal(arry){
    let addSubtotal = 0;
    for (let i = 0; i < localCart.length; i++) {
        if(document.getElementById('costItemN'+i).innerHTML !== ''){
            let cost = document.getElementById('costItemN'+i).textContent;
            addSubtotal += parseInt(cost);
        }
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

function showCartError(){
    document.getElementById('nullCart').style.visibility = "visible";
}

document.addEventListener('DOMContentLoaded',async ()=>{
    const itemsContainer = document.getElementById('cartItems');

    //trae un objeto de la nuve | deshabilitado para mejor funcionamiento del desafiate 6
    /* const cartData = await getJSONData(CART_INFO_URL + userID + EXT_TYPE);
    localCart = cartData.data.articles; */
    
    const sending = document.getElementById('sending');
    const total = document.getElementById('total');
    const selectSending = document.getElementById('sendingType');

    const viewPaymentMethod = document.getElementById('viewPaymentMethod');
    const typeSaved = document.getElementById('typeSaved');

    const creditCard = document.getElementById('creditCard');
    const accountNumb = document.getElementById('accountNumb');
    const wireTransf = document.getElementById('wireTransf');
    const cardId = document.getElementById('cardId');
    const cardSec = document.getElementById('cardSec');
    const cardExpir = document.getElementById('cardExpir');
    const selectTypePayment = document.getElementById('selectTypePayment');

    //si existen productos en el carrito local, los pushea al array para imprimirlos - desafiate 5
    if (localStorage.getItem('localCart')){
        let ItemsObj = JSON.parse(localStorage.getItem('localCart'))
        if(ItemsObj.length > 0 ){
            ItemsObj.forEach(element => localCart.push(element));
            itemsContainer.innerHTML = getCartProducts(localCart);
        }else {
            showCartError();
        }
    } else {
        showCartError();
    }

    //Obtener los precios
    itemsCostUpDate();

    selectSending.addEventListener('click',()=>{
        sending.innerHTML = getSendingPrice();
        total.innerHTML = getTotal();
    });

    creditCard.addEventListener('click',()=>{
        accountNumb.disabled = true;
        cardId.disabled = false;
        cardSec.disabled = false;
        cardExpir.disabled = false;
    });

    wireTransf.addEventListener('click',()=>{
        cardId.disabled = true;
        cardSec.disabled = true;
        cardExpir.disabled = true;
        accountNumb.disabled = false;
        accountNumb.required = true;
    });

    function paymentValidation(imput){
        if (imput.validity.valueMissing == true){
            imput.classList.add('is-invalid');
            selectTypePayment.classList.add('is-invalid');
        } else {
            imput.classList.remove('is-invalid');
        }
    } 
    //validacion modal
    typeSaved.addEventListener('click',(e)=>{
        if ((creditCard.checked != true)&& (wireTransf.checked != true)){
            creditCard.classList.add('is-invalid');
            selectTypePayment.classList.add('is-invalid');
        } else {
            creditCard.classList.remove('is-invalid');
            selectTypePayment.classList.remove('is-invalid');
        }
        if (creditCard.checked){
            paymentValidation(cardId);
            paymentValidation(cardSec);
            paymentValidation(cardExpir);
            if (!cardId.validity.valueMissing && !cardSec.validity.valueMissing && !cardExpir.validity.valueMissing){
                selectTypePayment.classList.remove('is-invalid');
                let paymentData = {
                    cardNumber : cardId.value,
                    securityCode : cardSec.value,
                    expiration : cardExpir.value
                }
                viewPaymentMethod.value = creditCard.value;
                document.getElementById('selectTypePayment').innerHTML = 'Cambiar forma de pago.'
                console.log(paymentData);
            } 
        }
        if (wireTransf.checked){
            paymentValidation(accountNumb);
            if(!accountNumb.validity.valueMissing){
                selectTypePayment.classList.remove('is-invalid');
                let paymentData = {
                    accountNumber : accountNumb.value
                }
                viewPaymentMethod.value = wireTransf.value;
                document.getElementById('selectTypePayment').innerHTML = 'Cambiar forma de pago.'
                console.log(paymentData);
            }
        }
    })
})

//bootstrap validation
var forms = document.querySelectorAll('.needs-validation')

// Loop over them and prevent submission
Array.prototype.slice.call(forms)
.forEach(function (form) {
    form.addEventListener('submit', function (event) {
    if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
    } else {
        document.getElementById('success').style.visibility = "visible";
        event.preventDefault()
        event.stopPropagation()
    }
    form.classList.add('was-validated')
    }, false)
})