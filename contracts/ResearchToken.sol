// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// Individual Token Contract for each research
contract ResearchToken is ERC20 {
    address public researcher;
    string public pdfHash;
    string public imageHash;
    string public memeDescription;
    uint256 public tokenPrice;
    bool public isActive;
    
    constructor(
        string memory name,
        string memory symbol,
        address _researcher,
        string memory _pdfHash,
        string memory _imageHash,
        string memory _memeDescription,
        uint256 _tokenPrice,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        researcher = _researcher;
        pdfHash = _pdfHash;
        imageHash = _imageHash;
        memeDescription = _memeDescription;
        tokenPrice = _tokenPrice;
        isActive = true;
        _mint(_researcher, initialSupply * 10 ** decimals());
    }
    
    function updateTokenPrice(uint256 newPrice) external {
        require(msg.sender == researcher, "Only researcher can update price");
        tokenPrice = newPrice;
    }
    
    function toggleActive() external {
        require(msg.sender == researcher, "Only researcher can toggle status");
        isActive = !isActive;
    }
    
    function buyTokens(uint256 amount) external payable {
        require(isActive, "Token sale is not active");
        require(msg.value == tokenPrice * amount, "Incorrect payment amount");
        
        address payable researcherPayable = payable(researcher);
        (bool sent, ) = researcherPayable.call{value: msg.value}("");
        require(sent, "Failed to send payment");
        
        _transfer(researcher, msg.sender, amount * 10 ** decimals());
    }
}

// Factory Contract to manage token creation
contract DesciMemeFactory is Ownable {
    using Counters for Counters.Counter;
    
    struct ResearchInfo {
        address tokenAddress;
        string name;
        string symbol;
        address researcher;
        uint256 timestamp;
    }
    
    Counters.Counter private _tokenIds;
    mapping(uint256 => ResearchInfo) public researches;
    mapping(address => uint256[]) public researcherToTokens;
    
    event TokenCreated(
        uint256 indexed tokenId,
        address indexed tokenAddress,
        address indexed researcher,
        string name,
        string symbol
    );
    
    constructor() Ownable(msg.sender) {}
    
    function createResearchToken(
        string memory name,
        string memory symbol,
        string memory pdfHash,
        string memory imageHash,
        string memory memeDescription,
        uint256 tokenPrice,
        uint256 initialSupply
    ) external returns (address) {
        require(bytes(pdfHash).length > 0, "PDF hash required");
        require(bytes(imageHash).length > 0, "Image hash required");
        require(bytes(memeDescription).length > 0, "Meme description required");
        require(tokenPrice > 0, "Token price must be greater than 0");
        require(initialSupply > 0, "Initial supply must be greater than 0");
        
        ResearchToken newToken = new ResearchToken(
            name,
            symbol,
            msg.sender,
            pdfHash,
            imageHash,
            memeDescription,
            tokenPrice,
            initialSupply
        );
        
        uint256 tokenId = _tokenIds.current();
        
        ResearchInfo memory newResearch = ResearchInfo({
            tokenAddress: address(newToken),
            name: name,
            symbol: symbol,
            researcher: msg.sender,
            timestamp: block.timestamp
        });
        
        researches[tokenId] = newResearch;
        researcherToTokens[msg.sender].push(tokenId);
        
        emit TokenCreated(
            tokenId,
            address(newToken),
            msg.sender,
            name,
            symbol
        );
        
        _tokenIds.increment();
        return address(newToken);
    }
    
    function getResearchToken(uint256 tokenId) external view returns (ResearchInfo memory) {
        return researches[tokenId];
    }
    
    function getResearcherTokens(address researcher) external view returns (uint256[] memory) {
        return researcherToTokens[researcher];
    }
    
    function getAllResearchCount() external view returns (uint256) {
        return _tokenIds.current();
    }
}