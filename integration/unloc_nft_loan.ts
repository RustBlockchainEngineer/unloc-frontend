export type UnlocNftLoan = {
  version: '0.1.0'
  name: 'unloc_nft_loan'
  instructions: [
    {
      name: 'setGlobalState'
      accounts: [
        {
          name: 'superOwner'
          isMut: true
          isSigner: true
        },
        {
          name: 'globalState'
          isMut: true
          isSigner: false
        },
        {
          name: 'newSuperOwner'
          isMut: false
          isSigner: false
        },
        {
          name: 'treasuryWallet'
          isMut: false
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'rent'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'accruedInterestNumerator'
          type: 'u64'
        },
        {
          name: 'denominator'
          type: 'u64'
        },
        {
          name: 'aprNumerator'
          type: 'u64'
        },
        {
          name: 'expireDurationForLender'
          type: 'u64'
        }
      ]
    },
    {
      name: 'setOffer'
      accounts: [
        {
          name: 'borrower'
          isMut: true
          isSigner: true
        },
        {
          name: 'offer'
          isMut: true
          isSigner: false
        },
        {
          name: 'nftMint'
          isMut: false
          isSigner: false
        },
        {
          name: 'nftVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'userVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'rent'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'setSubOffer'
      accounts: [
        {
          name: 'borrower'
          isMut: true
          isSigner: true
        },
        {
          name: 'globalState'
          isMut: false
          isSigner: false
        },
        {
          name: 'offer'
          isMut: true
          isSigner: false
        },
        {
          name: 'subOffer'
          isMut: true
          isSigner: false
        },
        {
          name: 'offerMint'
          isMut: false
          isSigner: false
        },
        {
          name: 'treasuryWallet'
          isMut: true
          isSigner: false
        },
        {
          name: 'treasuryVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'rent'
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: 'offerAmount'
          type: 'u64'
        },
        {
          name: 'subOfferNumber'
          type: 'u64'
        },
        {
          name: 'loanDuration'
          type: 'u64'
        },
        {
          name: 'minRepaidNumerator'
          type: 'u64'
        },
        {
          name: 'aprNumerator'
          type: 'u64'
        }
      ]
    },
    {
      name: 'cancelOffer'
      accounts: [
        {
          name: 'borrower'
          isMut: true
          isSigner: true
        },
        {
          name: 'offer'
          isMut: true
          isSigner: false
        },
        {
          name: 'nftVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'userVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'cancelSubOffer'
      accounts: [
        {
          name: 'borrower'
          isMut: true
          isSigner: true
        },
        {
          name: 'offer'
          isMut: true
          isSigner: false
        },
        {
          name: 'subOffer'
          isMut: true
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'acceptOffer'
      accounts: [
        {
          name: 'lender'
          isMut: true
          isSigner: true
        },
        {
          name: 'borrower'
          isMut: true
          isSigner: false
        },
        {
          name: 'offer'
          isMut: true
          isSigner: false
        },
        {
          name: 'subOffer'
          isMut: true
          isSigner: false
        },
        {
          name: 'offerMint'
          isMut: true
          isSigner: false
        },
        {
          name: 'offerVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'userVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'systemProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'rent'
          isMut: false
          isSigner: false
        },
        {
          name: 'clock'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'repayLoan'
      accounts: [
        {
          name: 'borrower'
          isMut: true
          isSigner: true
        },
        {
          name: 'globalState'
          isMut: false
          isSigner: false
        },
        {
          name: 'offer'
          isMut: true
          isSigner: false
        },
        {
          name: 'subOffer'
          isMut: true
          isSigner: false
        },
        {
          name: 'offerVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'userVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        },
        {
          name: 'clock'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'claimLoanPayment'
      accounts: [
        {
          name: 'lender'
          isMut: true
          isSigner: true
        },
        {
          name: 'borrower'
          isMut: false
          isSigner: false
        },
        {
          name: 'globalState'
          isMut: false
          isSigner: false
        },
        {
          name: 'offer'
          isMut: true
          isSigner: false
        },
        {
          name: 'subOffer'
          isMut: true
          isSigner: false
        },
        {
          name: 'offerVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'userVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'treasuryVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'claimLoan'
      accounts: [
        {
          name: 'borrower'
          isMut: true
          isSigner: true
        },
        {
          name: 'offer'
          isMut: true
          isSigner: false
        },
        {
          name: 'subOffer'
          isMut: true
          isSigner: false
        },
        {
          name: 'offerVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'userVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: 'claimCollateral'
      accounts: [
        {
          name: 'borrower'
          isMut: true
          isSigner: true
        },
        {
          name: 'offer'
          isMut: true
          isSigner: false
        },
        {
          name: 'subOffer'
          isMut: true
          isSigner: false
        },
        {
          name: 'nftVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'userVault'
          isMut: true
          isSigner: false
        },
        {
          name: 'tokenProgram'
          isMut: false
          isSigner: false
        }
      ]
      args: []
    }
  ]
  accounts: [
    {
      name: 'globalState'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'superOwner'
            type: 'publicKey'
          },
          {
            name: 'treasuryWallet'
            type: 'publicKey'
          },
          {
            name: 'accruedInterestNumerator'
            type: 'u64'
          },
          {
            name: 'aprNumerator'
            type: 'u64'
          },
          {
            name: 'denominator'
            type: 'u64'
          },
          {
            name: 'expireDurationForLender'
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'offer'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'borrower'
            type: 'publicKey'
          },
          {
            name: 'nftMint'
            type: 'publicKey'
          },
          {
            name: 'nftVault'
            type: 'publicKey'
          },
          {
            name: 'state'
            type: 'u8'
          },
          {
            name: 'subOfferCount'
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'subOffer'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'borrower'
            type: 'publicKey'
          },
          {
            name: 'nftMint'
            type: 'publicKey'
          },
          {
            name: 'offerMint'
            type: 'publicKey'
          },
          {
            name: 'state'
            type: 'u8'
          },
          {
            name: 'offer'
            type: 'publicKey'
          },
          {
            name: 'subOfferNumber'
            type: 'u64'
          },
          {
            name: 'lender'
            type: 'publicKey'
          },
          {
            name: 'offerVault'
            type: 'publicKey'
          },
          {
            name: 'offerAmount'
            type: 'u64'
          },
          {
            name: 'repaidAmount'
            type: 'u64'
          },
          {
            name: 'lenderClaimedAmount'
            type: 'u64'
          },
          {
            name: 'borrowerClaimedAmount'
            type: 'u64'
          },
          {
            name: 'loanStartedTime'
            type: 'u64'
          },
          {
            name: 'loanEndedTime'
            type: 'u64'
          },
          {
            name: 'loanDuration'
            type: 'u64'
          },
          {
            name: 'minRepaidNumerator'
            type: 'u64'
          },
          {
            name: 'aprNumerator'
            type: 'u64'
          }
        ]
      }
    }
  ]
  types: [
    {
      name: 'OfferState'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Proposed'
          },
          {
            name: 'Accepted'
          },
          {
            name: 'Expired'
          },
          {
            name: 'Fulfilled'
          },
          {
            name: 'NFTClaimed'
          },
          {
            name: 'Canceled'
          }
        ]
      }
    },
    {
      name: 'SubOfferState'
      type: {
        kind: 'enum'
        variants: [
          {
            name: 'Proposed'
          },
          {
            name: 'Accepted'
          },
          {
            name: 'Expired'
          },
          {
            name: 'Fulfilled'
          },
          {
            name: 'LoanPaymentClaimed'
          },
          {
            name: 'Canceled'
          },
          {
            name: 'NFTClaimed'
          }
        ]
      }
    }
  ]
  events: [
    {
      name: 'OfferSet'
      fields: []
    },
    {
      name: 'OfferAccepted'
      fields: []
    },
    {
      name: 'OfferCanceled'
      fields: []
    },
    {
      name: 'NFTClaimed'
      fields: []
    },
    {
      name: 'LoanRepaid'
      fields: []
    },
    {
      name: 'LoanClaimed'
      fields: []
    }
  ]
  errors: [
    {
      code: 6000
      name: 'Unauthorized'
      msg: 'You are not authorized to perform this action.'
    },
    {
      code: 6001
      name: 'AlreadyInUse'
      msg: 'AlreadyInUse'
    },
    {
      code: 6002
      name: 'InvalidProgramAddress'
      msg: 'InvalidProgramAddress'
    },
    {
      code: 6003
      name: 'InvalidState'
      msg: 'InvalidState'
    },
    {
      code: 6004
      name: 'InvalidOwner'
      msg: 'InvalidOwner'
    },
    {
      code: 6005
      name: 'NotAllowed'
      msg: 'NotAllowed'
    },
    {
      code: 6006
      name: 'MathOverflow'
      msg: 'Math operation overflow'
    },
    {
      code: 6007
      name: 'InvalidAccountInput'
      msg: 'InvalidAccountInput'
    },
    {
      code: 6008
      name: 'InvalidPubkey'
      msg: 'InvalidPubkey'
    },
    {
      code: 6009
      name: 'InvalidAmount'
      msg: 'InvalidAmount'
    }
  ]
}

export const IDL: UnlocNftLoan = {
  version: '0.1.0',
  name: 'unloc_nft_loan',
  instructions: [
    {
      name: 'setGlobalState',
      accounts: [
        {
          name: 'superOwner',
          isMut: true,
          isSigner: true
        },
        {
          name: 'globalState',
          isMut: true,
          isSigner: false
        },
        {
          name: 'newSuperOwner',
          isMut: false,
          isSigner: false
        },
        {
          name: 'treasuryWallet',
          isMut: false,
          isSigner: false
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: 'accruedInterestNumerator',
          type: 'u64'
        },
        {
          name: 'denominator',
          type: 'u64'
        },
        {
          name: 'aprNumerator',
          type: 'u64'
        },
        {
          name: 'expireDurationForLender',
          type: 'u64'
        }
      ]
    },
    {
      name: 'setOffer',
      accounts: [
        {
          name: 'borrower',
          isMut: true,
          isSigner: true
        },
        {
          name: 'offer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'nftMint',
          isMut: false,
          isSigner: false
        },
        {
          name: 'nftVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'userVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: 'setSubOffer',
      accounts: [
        {
          name: 'borrower',
          isMut: true,
          isSigner: true
        },
        {
          name: 'globalState',
          isMut: false,
          isSigner: false
        },
        {
          name: 'offer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'subOffer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'offerMint',
          isMut: false,
          isSigner: false
        },
        {
          name: 'treasuryWallet',
          isMut: true,
          isSigner: false
        },
        {
          name: 'treasuryVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: 'offerAmount',
          type: 'u64'
        },
        {
          name: 'subOfferNumber',
          type: 'u64'
        },
        {
          name: 'loanDuration',
          type: 'u64'
        },
        {
          name: 'minRepaidNumerator',
          type: 'u64'
        },
        {
          name: 'aprNumerator',
          type: 'u64'
        }
      ]
    },
    {
      name: 'cancelOffer',
      accounts: [
        {
          name: 'borrower',
          isMut: true,
          isSigner: true
        },
        {
          name: 'offer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'nftVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'userVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: 'cancelSubOffer',
      accounts: [
        {
          name: 'borrower',
          isMut: true,
          isSigner: true
        },
        {
          name: 'offer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'subOffer',
          isMut: true,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: 'acceptOffer',
      accounts: [
        {
          name: 'lender',
          isMut: true,
          isSigner: true
        },
        {
          name: 'borrower',
          isMut: true,
          isSigner: false
        },
        {
          name: 'offer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'subOffer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'offerMint',
          isMut: true,
          isSigner: false
        },
        {
          name: 'offerVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'userVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false
        },
        {
          name: 'clock',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: 'repayLoan',
      accounts: [
        {
          name: 'borrower',
          isMut: true,
          isSigner: true
        },
        {
          name: 'globalState',
          isMut: false,
          isSigner: false
        },
        {
          name: 'offer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'subOffer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'offerVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'userVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'clock',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: 'claimLoanPayment',
      accounts: [
        {
          name: 'lender',
          isMut: true,
          isSigner: true
        },
        {
          name: 'borrower',
          isMut: false,
          isSigner: false
        },
        {
          name: 'globalState',
          isMut: false,
          isSigner: false
        },
        {
          name: 'offer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'subOffer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'offerVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'userVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'treasuryVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: 'claimLoan',
      accounts: [
        {
          name: 'borrower',
          isMut: true,
          isSigner: true
        },
        {
          name: 'offer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'subOffer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'offerVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'userVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: 'claimCollateral',
      accounts: [
        {
          name: 'borrower',
          isMut: true,
          isSigner: true
        },
        {
          name: 'offer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'subOffer',
          isMut: true,
          isSigner: false
        },
        {
          name: 'nftVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'userVault',
          isMut: true,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: 'globalState',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'superOwner',
            type: 'publicKey'
          },
          {
            name: 'treasuryWallet',
            type: 'publicKey'
          },
          {
            name: 'accruedInterestNumerator',
            type: 'u64'
          },
          {
            name: 'aprNumerator',
            type: 'u64'
          },
          {
            name: 'denominator',
            type: 'u64'
          },
          {
            name: 'expireDurationForLender',
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'offer',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'borrower',
            type: 'publicKey'
          },
          {
            name: 'nftMint',
            type: 'publicKey'
          },
          {
            name: 'nftVault',
            type: 'publicKey'
          },
          {
            name: 'state',
            type: 'u8'
          },
          {
            name: 'subOfferCount',
            type: 'u64'
          }
        ]
      }
    },
    {
      name: 'subOffer',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'borrower',
            type: 'publicKey'
          },
          {
            name: 'nftMint',
            type: 'publicKey'
          },
          {
            name: 'offerMint',
            type: 'publicKey'
          },
          {
            name: 'state',
            type: 'u8'
          },
          {
            name: 'offer',
            type: 'publicKey'
          },
          {
            name: 'subOfferNumber',
            type: 'u64'
          },
          {
            name: 'lender',
            type: 'publicKey'
          },
          {
            name: 'offerVault',
            type: 'publicKey'
          },
          {
            name: 'offerAmount',
            type: 'u64'
          },
          {
            name: 'repaidAmount',
            type: 'u64'
          },
          {
            name: 'lenderClaimedAmount',
            type: 'u64'
          },
          {
            name: 'borrowerClaimedAmount',
            type: 'u64'
          },
          {
            name: 'loanStartedTime',
            type: 'u64'
          },
          {
            name: 'loanEndedTime',
            type: 'u64'
          },
          {
            name: 'loanDuration',
            type: 'u64'
          },
          {
            name: 'minRepaidNumerator',
            type: 'u64'
          },
          {
            name: 'aprNumerator',
            type: 'u64'
          }
        ]
      }
    }
  ],
  types: [
    {
      name: 'OfferState',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Proposed'
          },
          {
            name: 'Accepted'
          },
          {
            name: 'Expired'
          },
          {
            name: 'Fulfilled'
          },
          {
            name: 'NFTClaimed'
          },
          {
            name: 'Canceled'
          }
        ]
      }
    },
    {
      name: 'SubOfferState',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Proposed'
          },
          {
            name: 'Accepted'
          },
          {
            name: 'Expired'
          },
          {
            name: 'Fulfilled'
          },
          {
            name: 'LoanPaymentClaimed'
          },
          {
            name: 'Canceled'
          },
          {
            name: 'NFTClaimed'
          }
        ]
      }
    }
  ],
  events: [
    {
      name: 'OfferSet',
      fields: []
    },
    {
      name: 'OfferAccepted',
      fields: []
    },
    {
      name: 'OfferCanceled',
      fields: []
    },
    {
      name: 'NFTClaimed',
      fields: []
    },
    {
      name: 'LoanRepaid',
      fields: []
    },
    {
      name: 'LoanClaimed',
      fields: []
    }
  ],
  errors: [
    {
      code: 6000,
      name: 'Unauthorized',
      msg: 'You are not authorized to perform this action.'
    },
    {
      code: 6001,
      name: 'AlreadyInUse',
      msg: 'AlreadyInUse'
    },
    {
      code: 6002,
      name: 'InvalidProgramAddress',
      msg: 'InvalidProgramAddress'
    },
    {
      code: 6003,
      name: 'InvalidState',
      msg: 'InvalidState'
    },
    {
      code: 6004,
      name: 'InvalidOwner',
      msg: 'InvalidOwner'
    },
    {
      code: 6005,
      name: 'NotAllowed',
      msg: 'NotAllowed'
    },
    {
      code: 6006,
      name: 'MathOverflow',
      msg: 'Math operation overflow'
    },
    {
      code: 6007,
      name: 'InvalidAccountInput',
      msg: 'InvalidAccountInput'
    },
    {
      code: 6008,
      name: 'InvalidPubkey',
      msg: 'InvalidPubkey'
    },
    {
      code: 6009,
      name: 'InvalidAmount',
      msg: 'InvalidAmount'
    }
  ]
}
