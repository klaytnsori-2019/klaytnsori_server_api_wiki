// Klaytn IDE uses solidity 0.4.24, 0.5.6 versions.
pragma solidity 0.4.24;

contract KlaytnsoriContract {
    address public feePayer;
    
    mapping (address => uint) questioners;
    
    constructor() public {
        feePayer = msg.sender;
    }
    
    function getBalance() public view returns (uint){
        return address(this).balance;
    }
    
    function setQuestionerBalance(address _address, uint _value) private{
        if(questioners[_address] == 0){
            questioners[_address] = _value;
        }
        else{
            questioners[_address] += _value;
        }
    }
    
    function getQuestionerBalance(address _address) public view returns (uint){
        return questioners[_address];
    }
    
    function deposit() public payable{
        setQuestionerBalance(msg.sender, msg.value);
    }
    
    function transfer(address _questionerAddress, uint _value) public returns (bool){
        require(_value <= getQuestionerBalance(_questionerAddress));
        msg.sender.transfer(_value);
        setQuestionerBalance(_questionerAddress, -(_value));
        return true;
    }
    
}