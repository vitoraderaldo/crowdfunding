pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvers;
    }
    
    address public manager;
    uint public minContribution;
    mapping(address => bool) public contributors;
    uint public contributorsCount;
    Request[] public requests;
    
    function Campaign(uint minimum, address sender) public {
        manager = sender;
        minContribution = minimum;
    }
    
    function contribute() public payable {
        require(msg.value >= minContribution);
        contributors[msg.sender] = true;
        contributorsCount++;
    }
    
    function createRequest(string description, uint value, address recipient) public onlyManager {
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });
        requests.push(newRequest);
    }

    function approveRequest(uint index) public nonManager {
        Request storage request = requests[index];
        
        // Must be a contributor
        require(contributors[msg.sender]);
        // Must not have voted before
        require(!request.approvers[msg.sender]);
        
        // Add the sender as a voter
        request.approvers[msg.sender] = true;
        request.approvalCount++;
    }
    
    function finalizeRequest(uint index) public onlyManager {
        Request storage request = requests[index];
        
        // Make sure it was not finalized before
        require(!request.complete);
        // Make sure it has enough approvers
        require(request.approvalCount > (contributorsCount/2));
        
        // Send the money to the recipient
        request.recipient.transfer(request.value);
        // Mark as completed
        request.complete = true;
    }

    function getSummary() public view returns (uint, uint, uint, uint, address) {
        return (minContribution, this.balance, requests.length, contributorsCount, manager);
    }

    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }
    
    modifier onlyManager() {
        require(msg.sender == manager);
        _;
    }
    
    modifier nonManager() {
        require(msg.sender != manager);
        _;
    }
   
}


/* 

    Nao deixar o manager contribuir?
    Nao deixar a mesma pessoa contribuir novamente pro mesmo request
    
*/
