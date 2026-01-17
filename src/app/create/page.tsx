'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, X, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategoryGrid, categories } from '@/components/features/category-grid'
import { cn } from '@/lib/utils'

const conditions = [
  { id: 'new', label: 'New', description: 'Never used, with tags' },
  { id: 'like_new', label: 'Like New', description: 'Barely used, excellent' },
  { id: 'good', label: 'Good', description: 'Used, works great' },
  { id: 'fair', label: 'Fair', description: 'Shows wear, functional' },
  { id: 'for_parts', label: 'For Parts', description: 'May need repair' },
]

const wantsOptions = [
  { id: 'open', label: 'Open to offers', description: 'See what people propose' },
  { id: 'categories', label: 'Specific categories', description: 'Select what you want' },
  { id: 'specific', label: 'Something specific', description: 'Describe what you need' },
]

const availabilityOptions = [
  { id: 'weekday_morning', label: 'Weekday mornings' },
  { id: 'weekday_evening', label: 'Weekday evenings' },
  { id: 'weekend', label: 'Weekends' },
  { id: 'flexible', label: 'Flexible' },
]

export default function CreateListingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [isService, setIsService] = useState(false)
  const [condition, setCondition] = useState('')
  const [wantsType, setWantsType] = useState('open')
  const [wantsCategories, setWantsCategories] = useState<string[]>([])
  const [wantsDescription, setWantsDescription] = useState('')
  const [availability, setAvailability] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 5

  const canProceed = () => {
    switch (step) {
      case 1: return photos.length > 0 || isService
      case 2: return title.length >= 3 && category
      case 3: return isService || condition
      case 4: return wantsType === 'open' ||
               (wantsType === 'categories' && wantsCategories.length > 0) ||
               (wantsType === 'specific' && wantsDescription.length > 0)
      case 5: return availability.length > 0
      default: return true
    }
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.back()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // TODO: API call to create listing
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }

  const addPhoto = () => {
    // Mock adding a photo
    setPhotos([...photos, `/placeholder-${photos.length + 1}.jpg`])
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const toggleAvailability = (id: string) => {
    setAvailability(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const toggleWantsCategory = (cat: string) => {
    setWantsCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={handleBack} className="p-2 -ml-2">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex-1 text-center">
            <span className="font-semibold">Create Listing</span>
            <div className="flex gap-1 justify-center mt-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 w-8 rounded-full',
                    i < step ? 'bg-green-600' : 'bg-gray-200'
                  )}
                />
              ))}
            </div>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Step 1: Photos */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add photos</h2>
              <p className="mt-1 text-gray-600">Good photos help you swap faster!</p>
            </div>

            {/* Service toggle */}
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={isService}
                onChange={(e) => setIsService(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <span className="font-medium text-gray-900">This is a service</span>
                <p className="text-sm text-gray-500">Like tutoring, repairs, etc.</p>
              </div>
            </label>

            {/* Photo grid */}
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center text-4xl">
                    📦
                  </div>
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 h-6 w-6 bg-black/50 rounded-full flex items-center justify-center"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}
              {photos.length < 8 && (
                <button
                  onClick={addPhoto}
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors"
                >
                  <Camera className="h-8 w-8" />
                  <span className="mt-1 text-xs">Add photo</span>
                </button>
              )}
            </div>

            {!isService && photos.length === 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                Tip: Natural light works best. Show the item from multiple angles.
              </p>
            )}
          </div>
        )}

        {/* Step 2: Title & Category */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">What are you swapping?</h2>
              <p className="mt-1 text-gray-600">Give it a clear, descriptive title</p>
            </div>

            <Input
              label="Title"
              placeholder="e.g., Kids bicycle, 20-inch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <CategoryGrid
                selected={category}
                onSelect={setCategory}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                placeholder="Include brand, size, age, any flaws..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>
        )}

        {/* Step 3: Condition */}
        {step === 3 && !isService && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Item condition</h2>
              <p className="mt-1 text-gray-600">Be honest to build trust</p>
            </div>

            <div className="space-y-3">
              {conditions.map((cond) => (
                <button
                  key={cond.id}
                  onClick={() => setCondition(cond.id)}
                  className={cn(
                    'w-full p-4 rounded-xl text-left transition-colors border-2',
                    condition === cond.id
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{cond.label}</span>
                      <p className="text-sm text-gray-500">{cond.description}</p>
                    </div>
                    {condition === cond.id && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 for services - skip condition */}
        {step === 3 && isService && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Service details</h2>
              <p className="mt-1 text-gray-600">Help people understand what you offer</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What does your service include?
              </label>
              <textarea
                placeholder="Describe what you'll do, how long it takes, any requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={6}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>
        )}

        {/* Step 4: What you want */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">What do you want?</h2>
              <p className="mt-1 text-gray-600">Let people know what you&apos;re looking for</p>
            </div>

            <div className="space-y-3">
              {wantsOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setWantsType(opt.id)}
                  className={cn(
                    'w-full p-4 rounded-xl text-left transition-colors border-2',
                    wantsType === opt.id
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{opt.label}</span>
                      <p className="text-sm text-gray-500">{opt.description}</p>
                    </div>
                    {wantsType === opt.id && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {wantsType === 'categories' && (
              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select categories you&apos;re interested in
                </label>
                <CategoryGrid
                  selected={wantsCategories}
                  onSelect={toggleWantsCategory}
                  multiSelect
                />
              </div>
            )}

            {wantsType === 'specific' && (
              <div className="pt-4">
                <Input
                  label="What are you looking for?"
                  placeholder="e.g., Guitar lessons, power tools, kids toys..."
                  value={wantsDescription}
                  onChange={(e) => setWantsDescription(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 5: Availability */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">When can you meet?</h2>
              <p className="mt-1 text-gray-600">Select your general availability</p>
            </div>

            <div className="space-y-3">
              {availabilityOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => toggleAvailability(opt.id)}
                  className={cn(
                    'w-full p-4 rounded-xl text-left transition-colors border-2',
                    availability.includes(opt.id)
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{opt.label}</span>
                    {availability.includes(opt.id) && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            loading={isSubmitting}
            className="w-full"
            size="lg"
          >
            {step === totalSteps ? (
              isSubmitting ? 'Publishing...' : 'Publish Listing'
            ) : (
              <>
                Next
                <ChevronRight className="h-5 w-5 ml-1" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  )
}
