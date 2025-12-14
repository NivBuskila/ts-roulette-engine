import { RNGService } from './rng.service';

describe('RNGService', () => {
  let rngService: RNGService;

  beforeEach(() => {
    rngService = new RNGService();
  });

  it('should rotate server seed after every spin', () => {
    // First spin
    const result1 = rngService.spin();
    const seed1 = result1.serverSeed;
    const hash1 = result1.serverSeedHash;

    // Check that the service has a NEW hash now (different from the one in result1)
    // This confirms that rotateServerSeed() was called at the end of spin()
    const currentHash = rngService.getServerSeedHash();
    expect(currentHash).not.toBe(hash1);

    // Second spin
    const result2 = rngService.spin();
    const seed2 = result2.serverSeed;
    
    // The seed revealed in result2 should be different from seed1
    expect(seed2).not.toBe(seed1);
  });
});
