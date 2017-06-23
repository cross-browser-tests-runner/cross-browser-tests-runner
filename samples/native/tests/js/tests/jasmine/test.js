describe('sum', function() {
  describe('working', function() {
    it('should return the sum of two numbers', function() {
      expect(sum(2, 2)).toEqual(4)
    })
  })
  describe('non-working', function() {
    it('should return 0 as sum of two numbers', function() {
      expect(sum(2, 2)).toEqual(0)
    })
  })
})

describe('mult', function() {
  describe('working', function() {
    it('should return the product of two numbers', function() {
      expect(mult(2, 3)).toEqual(6)
    })
  })
  describe('non-working', function() {
    it('should return 0 as product of two numbers', function() {
      expect(mult(2, 2)).toEqual(0)
    })
  })
})
