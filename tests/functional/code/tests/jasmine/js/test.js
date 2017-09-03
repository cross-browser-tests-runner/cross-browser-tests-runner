describe('sum', function() {
  describe('suite 1', function() {
    it('should return the sum of two numbers', function() {
      expect(sum(2, 2)).toEqual(4)
    })
  })
  describe('suite 2', function() {
    it('should treat 0 as 1', function() {
      expect(sum(2, 0)).toEqual(3)
    })
  })
})

describe('mult', function() {
  describe('suite 1', function() {
    it('should return the product of two numbers', function() {
      expect(mult(2, 3)).toEqual(6)
    })
  })
  describe('suite 2', function() {
    it('should treat 1 as 0', function() {
      expect(mult(2, 1)).toEqual(0)
    })
  })
})

describe('always true', function() {
  describe('suite 1', function() {
    it('should say 1 is 1', function() {
      expect(1).toEqual(1)
    })
  })
  describe('suite 2', function() {
    it('should say 1 is not 0', function() {
      expect(1).not.toEqual(0)
    })
  })
})
