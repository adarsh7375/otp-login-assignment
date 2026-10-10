export type RegistrationInput = {
  email: string
  firstName: string
  lastName: string
  phone: string
}

export type CheckoutInput = {
  email: string
  phone: string
  shippingAddress: string
}

export type UserProfile = RegistrationInput

export type AuthenticatedRequest = import('express').Request & { userId?: number }
