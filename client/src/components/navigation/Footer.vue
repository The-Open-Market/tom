<template>
  <footer class="p-4 bg-white shadow-lg md:flex md:items-center md:justify-between md:p-6">
    <span class="text-sm text-gray-500 sm:text-center">© {{ new Date().getFullYear() }}
      <a href="https://github.com/The-Open-Market/tom" class="hover:underline">TOM</a>.
      MIT license.
    </span>
    <ul class="flex flex-wrap items-center mt-3 text-sm text-gray-500 sm:mt-0">
        <li>
            <a :href="`${publicPath}/TOM The Open City Distribution Framework for Supply Chain Management on Ethereum.pdf`" class="mr-4 hover:underline md:mr-6 ">Read the paper here</a>
        </li>
    </ul>
</footer>
</template>

<script>
export default {
  name: "Footer",

  setup () {
    const publicPath = process.env.NODE_ENV === 'production' ? '/tom' : '';

    return {
      publicPath
    }
  }
}
</script>