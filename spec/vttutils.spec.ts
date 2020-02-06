import { SubtitleRegionContainer, SubtitleLabel } from '../src/ts/components/subtitleoverlay';
import { VttUtils } from '../src/ts/vttutils';
import { VTTRegionProperties, VTTProperties } from 'bitmovin-player';
import { MockHelper } from './helper/MockHelper';

describe('Vtt Utils', () => {
  describe('Vtt Region', () => {
    it('should set region css properties', () => {
        const mockRegionContainer = generateSubtitleRegionContainerMock();
        const mockDomElement = MockHelper.generateDOMMock();
        mockRegionContainer.getDomElement = () => mockDomElement;
        const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
        VttUtils.setVttRegionStyles(mockRegionContainer, vttRegionProps, { width: 1000, height: 800 });

        expect(spyCss).toHaveBeenCalledTimes(8);
        expect(spyCss).toHaveBeenNthCalledWith(1, 'position', 'absolute');
        expect(spyCss).toHaveBeenNthCalledWith(2, 'overflow', 'hidden');
        expect(spyCss).toHaveBeenNthCalledWith(3, 'width', `${vttRegionProps.width}%`);
        expect(spyCss).toHaveBeenNthCalledWith(4, 'left', '75px');
        expect(spyCss).toHaveBeenNthCalledWith(5, 'right', 'unset');
        expect(spyCss).toHaveBeenNthCalledWith(6, 'top', '772px');
        expect(spyCss).toHaveBeenNthCalledWith(7, 'bottom', 'unset');
        expect(spyCss).toHaveBeenNthCalledWith(8, 'height', '28px');
      });
  });

  describe('Vtt Cue Box', () => {
    it('should set text align', () => {
      const mockRegionContainer = generateSubtitleCueBoxMock(false, { align: 'left' } as VTTProperties);
      const mockDomElement = MockHelper.generateDOMMock();
      mockRegionContainer.getDomElement = () => mockDomElement;
      const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');

      VttUtils.setVttCueBoxStyles(mockRegionContainer);
      
      expect(spyCss).toHaveBeenCalledTimes(11);
      expect(spyCss).toHaveBeenNthCalledWith(9, 'text-align', 'left');
    });

    describe('Default Cue Box Styles', () => {
      it('should set default cue box css properties without region', () => {
        const mockRegionContainer = generateSubtitleCueBoxMock(false);
        const mockDomElement = MockHelper.generateDOMMock();
        mockRegionContainer.getDomElement = () => mockDomElement;
        const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');

        VttUtils.setVttCueBoxStyles(mockRegionContainer);

        expect(spyCss).toHaveBeenCalledTimes(11);
        expect(spyCss).toHaveBeenNthCalledWith(1, 'position', 'absolute');
        expect(spyCss).toHaveBeenNthCalledWith(2, 'overflow-wrap', 'break-word');
        expect(spyCss).toHaveBeenNthCalledWith(3, 'overflow', 'hidden');
        expect(spyCss).toHaveBeenNthCalledWith(4, 'display', 'inline-flex');
        expect(spyCss).toHaveBeenNthCalledWith(5, 'flex-flow', 'column');
        expect(spyCss).toHaveBeenNthCalledWith(6, 'justify-content', 'flex-end');
      });

      it('should set default cue box css properties with region', () => {
        const mockRegionContainer = generateSubtitleCueBoxMock(true);
        const mockDomElement = MockHelper.generateDOMMock();
        mockRegionContainer.getDomElement = () => mockDomElement;
        const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');

        VttUtils.setVttCueBoxStyles(mockRegionContainer);

        expect(spyCss).toHaveBeenCalledTimes(7);
        expect(spyCss).toHaveBeenNthCalledWith(1, 'position', 'relative');
        expect(spyCss).toHaveBeenNthCalledWith(2, 'unicode-bidi', 'plaintext');
      });
    });

    describe('Cue Box Writing Direction', () => {
      describe('Horizontal Writing Direction', () => {
        it('should set horizontal-tb writing mode', () => {
          const mockRegionContainer = generateSubtitleCueBoxMock(false);
          const mockDomElement = MockHelper.generateDOMMock();
          mockRegionContainer.getDomElement = () => mockDomElement;
          const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
  
          VttUtils.setVttCueBoxStyles(mockRegionContainer);
  
          expect(spyCss).toHaveBeenCalledTimes(11);
          expect(spyCss).toHaveBeenNthCalledWith(7, 'writing-mode', 'horizontal-tb');
        });

        describe('Line Positioning', () => {
          it('should skip line positioning with default values', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
    
            expect(spyCss).toHaveBeenCalledTimes(11);
          });

          it('should set percentage line positioning', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { line: '50%', snapToLines: false } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(12);
            expect(spyCss).toHaveBeenNthCalledWith(9, 'top', '50%');
          });

          it('should set positive line positioning', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { line: 4, snapToLines: true } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(12);
            expect(spyCss).toHaveBeenNthCalledWith(9, 'top', '112px');
          });

          it('should set negative line positioning', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { line: -4, snapToLines: true } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(12);
            expect(spyCss).toHaveBeenNthCalledWith(9, 'bottom', '112px');
          });

          describe('Line Alignment', () => {
            it('should not do start line alignment', () => {
              const mockRegionContainer = generateSubtitleCueBoxMock(false, { line: '50%', snapToLines: false, lineAlign: 'start' } as VTTProperties);
              const mockDomElement = MockHelper.generateDOMMock();
              mockRegionContainer.getDomElement = () => mockDomElement;
              const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
      
              VttUtils.setVttCueBoxStyles(mockRegionContainer);
              
              expect(spyCss).toHaveBeenCalledTimes(12);
            });

            it('should do center line alignment', () => {
              const mockRegionContainer = generateSubtitleCueBoxMock(false, { line: '50%', snapToLines: false, lineAlign: 'center' } as VTTProperties);
              const mockDomElement = MockHelper.generateDOMMock();
              mockRegionContainer.getDomElement = () => mockDomElement;
              const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
      
              VttUtils.setVttCueBoxStyles(mockRegionContainer);
              
              expect(spyCss).toHaveBeenCalledTimes(13);
              expect(spyCss).toHaveBeenNthCalledWith(10, 'margin-top', '-14px');
            });

            it('should do end line alignment', () => {
              const mockRegionContainer = generateSubtitleCueBoxMock(false, { line: '50%', snapToLines: false, lineAlign: 'end' } as VTTProperties);
              const mockDomElement = MockHelper.generateDOMMock();
              mockRegionContainer.getDomElement = () => mockDomElement;
              const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
      
              VttUtils.setVttCueBoxStyles(mockRegionContainer);
              
              expect(spyCss).toHaveBeenCalledTimes(13);
              expect(spyCss).toHaveBeenNthCalledWith(10, 'margin-top', '-28px');
            });
          })
        });
      });

      describe('Vertical LR Writing Direction', () => {
        it('should set vertical-lr writing mode', () => {
          const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'lr' } as VTTProperties);
          const mockDomElement = MockHelper.generateDOMMock();
          mockRegionContainer.getDomElement = () => mockDomElement;
          const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
  
          VttUtils.setVttCueBoxStyles(mockRegionContainer);
          
          expect(spyCss).toHaveBeenCalledTimes(12);
          expect(spyCss).toHaveBeenNthCalledWith(7, 'writing-mode', 'vertical-lr');
          expect(spyCss).toHaveBeenNthCalledWith(8, 'right', '0');
        });

        describe('Line positioning', () => {
          it('should skip line positioning with default values', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'lr' } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(12);
          });

          it('should set percentage line positioning', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'lr', line: '50%', snapToLines: false } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(13);
            expect(spyCss).toHaveBeenNthCalledWith(10, 'right', '50%');
          });

          it('should set positive line positioning', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'lr', line: 4, snapToLines: true } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(13);
            expect(spyCss).toHaveBeenNthCalledWith(10, 'right', '112px');
          });

          it('should set negative line positioning', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'lr', line: -4, snapToLines: true } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(13);
            expect(spyCss).toHaveBeenNthCalledWith(10, 'left', '112px');
          });

          describe('Line alignment', () => {
            it('should not do start line alignment', () => {
              const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'lr', line: '50%', snapToLines: false, lineAlign: 'start' } as VTTProperties);
              const mockDomElement = MockHelper.generateDOMMock();
              mockRegionContainer.getDomElement = () => mockDomElement;
              const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
      
              VttUtils.setVttCueBoxStyles(mockRegionContainer);
              
              expect(spyCss).toHaveBeenCalledTimes(13);
            });

            it('should do center line alignment', () => {
              const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'lr', line: '50%', snapToLines: false, lineAlign: 'center' } as VTTProperties);
              const mockDomElement = MockHelper.generateDOMMock();
              mockRegionContainer.getDomElement = () => mockDomElement;
              const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
      
              VttUtils.setVttCueBoxStyles(mockRegionContainer);
              
              expect(spyCss).toHaveBeenCalledTimes(14);
              expect(spyCss).toHaveBeenNthCalledWith(11, 'margin-right', '-14px');
            });

            it('should do end line alignment', () => {
              const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'lr', line: '50%', snapToLines: false, lineAlign: 'end' } as VTTProperties);
              const mockDomElement = MockHelper.generateDOMMock();
              mockRegionContainer.getDomElement = () => mockDomElement;
              const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
      
              VttUtils.setVttCueBoxStyles(mockRegionContainer);
              
              expect(spyCss).toHaveBeenCalledTimes(14);
              expect(spyCss).toHaveBeenNthCalledWith(11, 'margin-right', '-28px');
            });
          })
        });
      });

      describe('Vertical RL Writing Direction', () => {
        it('should set vertical-rl writing mode', () => {
          const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'rl' } as VTTProperties);
          const mockDomElement = MockHelper.generateDOMMock();
          mockRegionContainer.getDomElement = () => mockDomElement;
          const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
  
          VttUtils.setVttCueBoxStyles(mockRegionContainer);
  
          expect(spyCss).toHaveBeenCalledTimes(12);
          expect(spyCss).toHaveBeenNthCalledWith(7, 'writing-mode', 'vertical-rl');
          expect(spyCss).toHaveBeenNthCalledWith(8, 'left', '0');
        });

        describe('Line positioning', () => {
          it('should skip line positioning with default values', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'rl' } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
    
            expect(spyCss).toHaveBeenCalledTimes(12);
          });

          it('should set percentage line positioning', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'rl', line: '50%', snapToLines: false } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(13);
            expect(spyCss).toHaveBeenNthCalledWith(10, 'left', '50%');
          });

          it('should set positive line positioning', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'rl', line: 4, snapToLines: true } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(13);
            expect(spyCss).toHaveBeenNthCalledWith(10, 'left', '112px');
          });

          it('should set negative line positioning', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'rl', line: -4, snapToLines: true } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(13);
            expect(spyCss).toHaveBeenNthCalledWith(10, 'right', '112px');
          });

          describe('Line alignment', () => {
            it('should not do start line alignment', () => {
              const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'rl', line: '50%', snapToLines: false, lineAlign: 'start' } as VTTProperties);
              const mockDomElement = MockHelper.generateDOMMock();
              mockRegionContainer.getDomElement = () => mockDomElement;
              const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
      
              VttUtils.setVttCueBoxStyles(mockRegionContainer);
              
              expect(spyCss).toHaveBeenCalledTimes(13);
            });

            it('should do center line alignment', () => {
              const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'rl', line: '50%', snapToLines: false, lineAlign: 'center' } as VTTProperties);
              const mockDomElement = MockHelper.generateDOMMock();
              mockRegionContainer.getDomElement = () => mockDomElement;
              const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
      
              VttUtils.setVttCueBoxStyles(mockRegionContainer);
              
              expect(spyCss).toHaveBeenCalledTimes(14);
              expect(spyCss).toHaveBeenNthCalledWith(11, 'margin-left', '-14px');
            });

            it('should do end line alignment', () => {
              const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'rl', line: '50%', snapToLines: false, lineAlign: 'end' } as VTTProperties);
              const mockDomElement = MockHelper.generateDOMMock();
              mockRegionContainer.getDomElement = () => mockDomElement;
              const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
      
              VttUtils.setVttCueBoxStyles(mockRegionContainer);
              
              expect(spyCss).toHaveBeenCalledTimes(14);
              expect(spyCss).toHaveBeenNthCalledWith(11, 'margin-left', '-28px');
            });
          })
        });
      });
    });

    describe('Cue Box Size', () => {
      describe('Vertical', () => {
        it('should set width', () => {
          const mockRegionContainer = generateSubtitleCueBoxMock(false);
          const mockDomElement = MockHelper.generateDOMMock();
          mockRegionContainer.getDomElement = () => mockDomElement;
          const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
  
          VttUtils.setVttCueBoxStyles(mockRegionContainer);
          
          expect(spyCss).toHaveBeenCalledTimes(11);
          expect(spyCss).toHaveBeenNthCalledWith(10, 'width', '100%');
        });

        describe('Position Align', () => {
          it('should set default position align', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(11);
            expect(spyCss).toHaveBeenNthCalledWith(11, 'left', '0');
          });
          
          it('should set position', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { position: 50 } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(11);
            expect(spyCss).toHaveBeenNthCalledWith(11, 'left', '50%');
          });

          it('should set left position align', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { position: 30, positionAlign: 'line-left' } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(12);
            expect(spyCss).toHaveBeenNthCalledWith(11, 'left', '30%');
            expect(spyCss).toHaveBeenNthCalledWith(12, 'right', 'auto');
          });

          it('should set center position align', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { position: 30, positionAlign: 'center' } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(12);
            expect(spyCss).toHaveBeenNthCalledWith(11, 'left', '-70%');
            expect(spyCss).toHaveBeenNthCalledWith(12, 'right', 'auto');
          });

          it('should set right position align', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { position: 30, positionAlign: 'line-right' } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(12);
            expect(spyCss).toHaveBeenNthCalledWith(11, 'left', 'auto');
            expect(spyCss).toHaveBeenNthCalledWith(12, 'right', '30%');
          });
        });
      });
      
      describe('Horizontal', () => {
        it('should set height', () => {
          const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'lr' } as VTTProperties);
          const mockDomElement = MockHelper.generateDOMMock();
          mockRegionContainer.getDomElement = () => mockDomElement;
          const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
  
          VttUtils.setVttCueBoxStyles(mockRegionContainer);
          
          expect(spyCss).toHaveBeenCalledTimes(12);
          expect(spyCss).toHaveBeenNthCalledWith(11, 'height', '100%');
        });

        describe('Position Align', () => {
          it('should set default position align', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'lr' } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(12);
            expect(spyCss).toHaveBeenNthCalledWith(12, 'top', '0');
          });

          it('should set position', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'lr', position: 50 } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(12);
            expect(spyCss).toHaveBeenNthCalledWith(12, 'top', '50%');
          });

          it('should set left position align', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'lr', position: 30, positionAlign: 'line-left' } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(13);
            expect(spyCss).toHaveBeenNthCalledWith(12, 'top', '30%');
            expect(spyCss).toHaveBeenNthCalledWith(13, 'bottom', 'auto');
          });

          it('should set center position align', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'lr', position: 30, positionAlign: 'center' } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(13);
            expect(spyCss).toHaveBeenNthCalledWith(12, 'top', '-70%');
            expect(spyCss).toHaveBeenNthCalledWith(13, 'bottom', 'auto');
          });

          it('should set right position align', () => {
            const mockRegionContainer = generateSubtitleCueBoxMock(false, { vertical: 'lr', position: 30, positionAlign: 'line-right' } as VTTProperties);
            const mockDomElement = MockHelper.generateDOMMock();
            mockRegionContainer.getDomElement = () => mockDomElement;
            const spyCss = jest.spyOn(mockRegionContainer.getDomElement(), 'css');
    
            VttUtils.setVttCueBoxStyles(mockRegionContainer);
            
            expect(spyCss).toHaveBeenCalledTimes(13);
            expect(spyCss).toHaveBeenNthCalledWith(12, 'top', 'auto');
            expect(spyCss).toHaveBeenNthCalledWith(13, 'bottom', '30%');
          });
        });
      })
    });
  });
});

function generateSubtitleRegionContainerMock(): SubtitleRegionContainer {
    const SubtitleRegionContainerClass: jest.Mock<SubtitleRegionContainer> = jest.fn().mockImplementation();
    return new SubtitleRegionContainerClass();
}

function generateSubtitleCueBoxMock(hasRegion: boolean, vttProps?: VTTProperties): SubtitleLabel {
    const region = hasRegion ? vttRegionProps : null;
    const SubtitleCueBoxClass: jest.Mock<SubtitleLabel> = jest.fn().mockImplementation(() => (
        {
            vtt: {
                ...generateVttProps(vttProps),
                region
            }
        }
    ));
    return new SubtitleCueBoxClass();
}

const vttRegionProps: VTTRegionProperties = {
    id: 'regionId',
    lines: 1,
    width: 70,
    regionAnchorX: 25,
    regionAnchorY: 100,
    viewportAnchorX: 25,
    viewportAnchorY: 100,
    scroll: ''
}

const generateVttProps = (props?: VTTProperties): VTTProperties => {
  const defaultProps = {
    vertical: '',
    align: 'center',
    size: 100,
    line: 'auto',
    lineAlign: 'start',
    position: 'auto',
    positionAlign: 'auto',
    snapToLines: false,
  }

  return {
    ...defaultProps,
    ...props
  }
}
