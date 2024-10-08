const urlParams = new URLSearchParams(window.location.search);
const numFloors = urlParams.get('noOfFloors');
const numLifts = urlParams.get('noOfLifts');


class Floor {
    constructor(floorNumber){
        this.floorNumber = floorNumber;
        this.lift = null
    }
}

class Lift {
    constructor(liftId, liftElement){
        this.liftId = liftId;
        this.liftElement = liftElement;
        this.currentFloor = 0;
        this.direction = null;
        this.moving = false;
    }

    moveToFloor(assignedLift, floorNumber, duration){
        assignedLift.moving = true;
        const liftElement = assignedLift.liftElement;

        const liftSimulation = document.getElementById('liftSimulation');
        const allFloors = liftSimulation.querySelectorAll('.floorings');
        const targetFloor = allFloors[floorNumber];

        const targetFloorRect = targetFloor.getBoundingClientRect();
        const mainPageRect = liftSimulation.getBoundingClientRect();

        const transformVal = targetFloorRect.top - mainPageRect.top;

        liftElement.style.transition = `transform ${duration}s linear`;
        liftElement.style.transform = `translateY(-${transformVal}px)`;

        setTimeout(() => {
            assignedLift.currentFloor = floorNumber;
            assignedLift.openDoors(assignedLift, duration);
        }, duration * 1000);
    }

    openDoors(assignedLift, duration){
        setTimeout(function(){
            const liftElement = assignedLift.liftElement;

            const leftDoor = liftElement.querySelector('.lift-door-left');
            const rightDoor = liftElement.querySelector('.lift-door-right');

            leftDoor.style.transition = `transform 2.5s linear`;
            rightDoor.style.transition = `transform 2.5s linear`;
            leftDoor.style.transform = 'translateX(-100%)';
            rightDoor.style.transform = 'translateX(100%)';

            setTimeout(function(){
                leftDoor.style.transform = 'translateX(0%)';
                rightDoor.style.transform = 'translateX(0%)';
                setTimeout(function(){
                    assignedLift.moving = false;
                    if(RequestQueue.length > 0){
                        const nextRequest = RequestQueue.shift();
                        console.log(nextRequest.floorNumber, nextRequest.buttondirection);  
                        assignLiftToFloor(nextRequest.floorNumber,nextRequest.buttondirection); 
                    }
                }, 2600);
            }, 2600)
        }, duration)
    }

    openDoorAnim(assignedLift,floorNumber){

        assignedLift.moving = true;
        console.log("open door anim");
        console.log("Assigned lift is : "+assignedLift);
        const liftElement = assignedLift.liftElement;
        console.log("Elemnent value is : "+liftElement);
        console.log("Lift floor in openDoors is : "+assignedLift.currentFloor);
        const leftDoor = liftElement.querySelector('.lift-door-left');
        const rightDoor = liftElement.querySelector('.lift-door-right');
        leftDoor.style.transition = `transform 2.5s linear`;
        rightDoor.style.transition = `transform 2.5s linear`;
        leftDoor.style.transform = 'translateX(-100%)';
        rightDoor.style.transform = 'translateX(100%)';

        setTimeout(function(){
            leftDoor.style.transform = 'translateX(0%)';
            rightDoor.style.transform = 'translateX(0%)';
            setTimeout(()=>{
            assignedLift.moving=false;
            console.log("Lift moving is set to false");
            if (RequestQueue.length > 0) {
            
            const nextRequest = RequestQueue.shift();
            assignLiftToFloor(nextRequest.floorNumber,nextRequest.buttondirection);}},2600)
        
        },2600)
    }
}

const floors = [];
const lifts = [];
var RequestQueue = [];

for(var i=numFloors-1 ; i>=0 ; i--){
    if(i==0){
        const newDiv = document.createElement('div');

        newDiv.className = 'floorings';
        newDiv.innerHTML = `
            <div class="floorname floor0">Floor ${i}</div>
            <div class="buttons">
                <button class="upbutton" onclick="assignLiftToFloor(${i}, 'up')">Up</button><br>
            </div>
        `
        for(var j=1 ; j<=numLifts ; j++){
            const liftDiv = document.createElement('div');
            const liftDoorLeft = document.createElement('div');
            const liftDoorRight = document.createElement('div');

            liftDiv.className = 'lift';
            liftDiv.id = `lift${i}`;
            liftDoorLeft.className = 'lift-door-left';
            liftDoorRight.className = 'lift-door-right';
            liftDiv.appendChild(liftDoorLeft);
            liftDiv.appendChild(liftDoorRight);
            newDiv.appendChild(liftDiv);
            lifts.push(new Lift(`lift${i}`, liftDiv));
        }
        floors[i]=new Floor(i);

        document.getElementById('liftSimulation').appendChild(newDiv);  
    }else if(i==numFloors-1){
        const newDiv = document.createElement('div');

        newDiv.className = 'floorings';
        newDiv.innerHTML = `
            <div class="floorname floor${i}">Floor ${i}</div>
            <div class="buttons">
                <button class="downbutton" onclick="assignLiftToFloor(${i}, 'down')">Down</button><br>
            </div>
        `
        floors[i]=new Floor(i);
        document.getElementById('liftSimulation').appendChild(newDiv);
    }else{
        const newDiv = document.createElement('div');

        newDiv.className = 'floorings';
        newDiv.innerHTML = `
            <div class="floorname floor${i}">Floor ${i}</div>
            <div class="buttons">
                <button class="upbutton" onclick="assignLiftToFloor(${i}, 'up')">Up</button><br>
                <button class="downbutton" onclick="assignLiftToFloor(${i}, 'down')">Down</button><br>
            </div>
        `
        floors[i]=new Floor(i);
        document.getElementById('liftSimulation').appendChild(newDiv);
    }
}

function assignLiftToFloor(floorNumber, buttondirection){
    
    let buttonSelector;
    if(buttondirection =='up'){
        buttonSelector = `.upbutton[onclick*="assignLiftToFloor(${floorNumber}, 'up')"]`;
    }else if(buttondirection == 'down'){
        buttonSelector = `.downbutton[onclick*="assignLiftToFloor(${floorNumber}, 'down')"]`;
    }

    const button = document.querySelector(buttonSelector);

    let availableLift = lifts.find(lift => lift.currentFloor === floorNumber &&lift.direction === buttondirection);

    if(availableLift !== undefined){
        openDoorsOnly(floorNumber, buttondirection);
    }else{
        var availablelift = lifts.find(lift => lift.currentFloor === null);


        let nearestLiftDistance = Infinity
        let nearestLift = null

        for(const lift of lifts){
            if(!lift.moving && lift.currentFloor !== null){
                const distance = Math.abs(lift.currentFloor - floorNumber)
                if(distance < nearestLiftDistance){
                    nearestLiftDistance = distance
                    nearestLift = lift
                }
            }
        }

        if(nearestLift){
            availablelift = nearestLift
            const currentFloor = availablelift.currentFloor
            const floorDifference = Math.abs(currentFloor - floorNumber)
            const duration = floorDifference * 2
            availablelift.currentFloor = floorNumber
            floors[floorNumber].lift = availablelift
            button.disabled = true

            setTimeout(() => {
                button.disabled = false
            }, (duration+5) * 1000)
            openLiftDoor(floorNumber, duration)
        }else{
            button.disabled = true
            console.log(`${floorNumber}, ${buttondirection} is added to the queue`);
            console.log(typeof buttondirection);
            RequestQueue.push({ floorNumber, buttondirection });
            console.log(RequestQueue[0]);   
        }    
    }
}

function openLiftDoor(floorNumber,duration){
    const assignedLift = floors[floorNumber].lift; 
    if (assignedLift) {
      assignedLift.moveToFloor(assignedLift,floorNumber,duration);
    }
}

function openDoorsOnly(floorNumber,buttondirection)
{
  const assignedLift = floors[floorNumber].lift;
  if (assignedLift) {
    assignedLift.openDoorAnim(assignedLift,floorNumber);
  }
}
